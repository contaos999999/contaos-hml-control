"""Inventário estático conservador. Somente biblioteca padrão, sem rede ou credenciais.

Uso: python <este arquivo> --gerar <checkout normativo> | --verificar
Imports são dependências de módulo, não prova de execução de cada função exportada.
"""
import argparse
import csv
import hashlib
import io
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
BASE = '90ae86432e617b880d603cff379878e623612a73'
BACK = '5eca44aebead3183e81b5c1af0d1dffa5fb8feb6'
RPC_NORMATIVAS_SHA256 = '07371474aaaf51badff5d6bceb5e4f1e3df381923907c5f57a7865df6c398272'
CORE = ['SYS01', 'SYS04', 'SYS05', 'ADM01'] + [f'V1{i:02}' for i in range(1, 24)]
NAMES = ['Contratantes', 'Novo contratante', 'Editar contratante', 'Contratos',
         'Novo contrato', 'Visão geral do contrato', 'Base normativa', 'Orçamento',
         'Listas e regras', 'Documentos do contrato', 'Detalhe e versões do documento',
         'Competências do contrato', 'Nova competência', 'Visão geral da competência',
         'Documentos da competência', 'Análise da competência', 'Requisito e evidências',
         'Parecer interno', 'Apresentação', 'Protocolo e pacote', 'Histórico',
         'Importação histórica', 'Trilha de auditoria']
LABELS = dict(zip([f'V1{i:02}' for i in range(1,24)], NAMES)) | {
    'SYS01': 'Login', 'SYS02': 'Esqueci a senha', 'SYS03': 'Redefinir senha',
    'SYS04': 'Organizações', 'SYS05': 'Painel', 'ADM01': 'Usuários e vínculos'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def ler(root, path):
    return (root / path).read_text()


def ref(path, text, pos):
    line = text.count('\n', 0, pos) + 1
    return {'arquivo': str(path), 'linha': line,
            'trecho': text.splitlines()[line - 1].strip()}


def rota(value):
    return '/'.join(x.rstrip('_') for x in value.split('/'))


def fontes_app(root):
    return sorted(str(p.relative_to(root)) for p in (root / 'src').rglob('*')
                  if p.suffix in {'.ts', '.tsx'} and '/test/' not in str(p)
                  and not str(p).endswith(('routeTree.gen.ts', '/types.ts')))


def imports(root, path):
    text = ler(root, path)
    result = []
    for m in re.finditer(r'(?:from\s+|import\s*\()["\']([^"\']+)', text):
        value = m[1]
        if value.startswith('@/'):
            base = root / 'src' / value[2:]
        elif value.startswith('.'):
            base = (root / path).parent / value
        else:
            continue
        for p in [base, Path(str(base)+'.ts'), Path(str(base)+'.tsx'), base/'index.ts', base/'index.tsx']:
            if p.is_file():
                result.append(str(p.resolve().relative_to(root.resolve())))
                break
        else:
            if not value.endswith('.css'):
                raise ValueError(f'Import local não resolvido: {path}: {value}')
    return sorted(set(result))


def fechamento(root, entry):
    visited = set()
    stack = [entry]
    while stack:
        path = stack.pop()
        if path in visited or path.endswith('/types.ts'):
            continue
        visited.add(path)
        stack.extend(imports(root, path))
    return sorted(visited)


def catalogo(root):
    s = ler(root, 'scripts/testc/visual-audit.mjs').split('export function cases')[0]
    uid = '00000000-0000-4000-8000-000000000001'
    result = []
    for m in re.finditer(r'\{ id: "([A-Z0-9]+)", path: (.+?) \}', s):
        expr = m[2].split(', public:')[0].split(', requiresDrawer:')[0]
        path = ''.join(x.strip().strip('"') if x.strip() != 'UUID' else uid for x in expr.split('+'))
        path = path.replace(uid, '$id', 1)
        if '/documentos/' in path:
            path = path.replace(uid, '$idDocumento')
        elif '/apresentacoes/' in path:
            path = path.replace(uid, '$apresentacaoId')
        result.append((m[1], path))
    return result


def operacoes(root, rpc_catalog):
    result = []
    for path in fontes_app(root):
        text = ler(root, path)
        # Todos os nomes RPC conhecidos, incluindo dispatch dinâmico e contratos tipados.
        for name in sorted(rpc_catalog):
            for m in re.finditer(r'(?:["\']' + re.escape(name) + r'["\']|\b' + re.escape(name) + r'\s*:)', text):
                if not (path.startswith('src/lib/') or path.startswith('src/components/')):
                    continue
                result.append({'tipo': 'rpc_referencia', 'nome': name, **ref(path,text,m.start())})
        for pattern, kind in [
            (r'\.from\(\s*"([a-z][a-z0-9_]*)"', 'tabela_select_ou_mutacao'),
            (r'\b[a-z_]+:([a-z_]+)![a-z_]+\(', 'tabela_relacionamento_select'),
            (r'"(storage-sign-upload|storage-sign-download|admin-invite-user|copilot-query)"', 'edge_referencia'),
            (r'\.auth\.([a-zA-Z]+)\s*\(', 'auth'),
            (r'\.storage\.from\(\s*([^)]+)\)', 'storage_bucket_dinamico'),
            (r'\bfetch\(\s*(endpointTus\(\)|location)', 'storage_tus'),
        ]:
            for m in re.finditer(pattern, text):
                result.append({'tipo': kind, 'nome': m[1], **ref(path,text,m.start())})
    return sorted(result, key=lambda o:(o['arquivo'],o['linha'],o['tipo'],o['nome']))


def sql_catalog(backend):
    catalog = {}
    for p in sorted((backend/'supabase/migrations').glob('*.sql')):
        text = p.read_text()
        pattern = r'create\s+(?:or\s+replace\s+)?function\s+(public|privado)\.([a-zA-Z0-9_]+)\s*\('
        for m in re.finditer(pattern, text, re.I):
            entry = ref(p.relative_to(backend), text, m.start())
            entry['schema'] = m[1].lower()
            entry['sha256'] = sha(p.read_bytes())
            rest=text[m.end():]
            delim=re.search(r'\bas\s+(\$[a-zA-Z_0-9]*\$)',rest,re.I)
            body=rest
            if delim:
                tail=rest[delim.end():]
                body=tail.split(delim[1],1)[0]
            entry['tabelas_referenciadas'] = sorted(set(re.findall(r'\b(?:from|join|into|update)\s+(?:public\.)?([a-z_][a-z0-9_]*)',body,re.I)) - {'select','set','excluded','jsonb_array_elements','jsonb_each','jsonb_object_keys','unnest','values','lateral'})
            catalog.setdefault(m[2], []).append(entry)
    return catalog


def rpc_normativas():
    contents=(HERE/'RPC_NORMATIVAS.json').read_bytes()
    if sha(contents)!=RPC_NORMATIVAS_SHA256:
        raise ValueError('Catálogo normativo independente adulterado')
    return json.loads(contents)


def gerar(root, backend=None):
    trusted=rpc_normativas()
    rpc = sql_catalog(backend) if backend else {r['nome']:r['definicoes_normativas'] for r in trusted}
    operations = operacoes(root, rpc)
    tables = {}
    for p in (root/'src/routes').glob('*.tsx'):
        text = p.read_text()
        m = re.search(r'createFileRoute\("([^"]+)"', text)
        if m:
            tables[rota(m[1])] = str(p.relative_to(root))
    screens = []
    for sid, path in catalogo(root):
        route_file = tables[path]
        component_import = re.search(r'import\s+\{\s*(\w+)\s*\}\s+from\s+"(@/components/[^"\n]+)"', ler(root,route_file))
        component = component_import[1]
        entry = 'src/' + component_import[2][2:] + '.tsx'
        if sid == 'V117':
            component, entry = 'RequirementDrawer', 'src/components/competencias/RequirementDrawer.tsx'
        deps = fechamento(root, entry)
        ownops = [i for i,o in enumerate(operations) if o['arquivo'] in deps]
        screens.append({'id': sid, 'nome': LABELS[sid], 'nucleo_27': sid in CORE,
                        'modulo': 'sistema' if sid.startswith('SYS') else 'administracao' if sid=='ADM01' else 'V1',
                        'rota': path, 'arquivo_rota': route_file, 'componente':component,
                        'entrada':entry, 'superficie': 'drawer' if sid=='V117' else 'pagina',
                        'dependencias_modulo':deps, 'operacoes_indices':ownops,
                        'runtime':'NAO_EXECUTADO_FASE1'})
    byid = {s['id']:s for s in screens}
    edges = []

    primary={
      'SYS01':'listar_organizacoes_disponiveis','SYS04':'criar_organizacao',
      'SYS05':'obter_resumo_dashboard','ADM01':'salvar_vinculo_usuario_adm',
      'V101':'contratantes','V102':'contratantes','V103':'atualizar_contratante',
      'V104':'contratos','V105':'contratos','V106':'atualizar_contrato_v1',
      'V107':'definir_aplicabilidade_fonte_v107','V108':'publicar_versao_proposta_v108',
      'V109':'executar_comando_lista_v1','V110':'criar_documento_contrato_completo',
      'V111':'adicionar_versao_documento_contrato','V112':'competencias',
      'V113':'criar_competencia','V114':'obter_visao_geral_competencia',
      'V115':'criar_documento_competencia_v115','V116':'solicitar_analise_competencia',
      'V117':'registrar_revisao_requisito_v117','V118':'aprovar_parecer_interno',
      'V119':'registrar_apresentacao','V120':'apresentacoes_contratante',
      'V121':'relatorios_historicos_contratante','V122':'registrar_relatorio_historico_hml',
      'V123':'eventos_auditoria'}

    def anchor(sid, resource=None):
        s=byid[sid]
        matches=[operations[i] for i in s['operacoes_indices'] if operations[i]['nome']==(resource or primary.get(sid))]
        if matches:
            o=matches[-1]
            return {k:o[k] for k in ['arquivo','linha','trecho']}
        return ref(s['entrada'],ler(root,s['entrada']),0)

    def localref(path, needle):
        text=ler(root,path)
        return ref(path,text,text.index(needle))

    reads={'SYS01':'listar_organizacoes_disponiveis','SYS04':'listar_organizacoes_disponiveis',
           'SYS05':'obter_resumo_dashboard','ADM01':'consultar_permissoes_efetivas',
           'V101':'contratantes','V102':'contratantes','V103':'contratantes',
           'V104':'contratos','V105':'contratantes','V106':'contratos',
           'V107':'fontes_normativas','V108':'propostas_orcamentarias',
           'V109':'listas_verificacao','V110':'documentos_contrato',
           'V111':'documentos_contrato','V112':'competencias','V113':'criar_competencia',
           'V114':'obter_visao_geral_competencia','V115':'obter_documentos_competencia_v115',
           'V116':'obter_analise_competencia_v116','V117':'obter_detalhe_requisito_v117',
           'V118':'pareceres_internos','V119':'obter_visao_geral_competencia',
           'V120':'apresentacoes_contratante','V121':'relatorios_historicos_contratante',
           'V122':'relatorios_historicos_contratante','V123':'eventos_auditoria'}

    def edge(a,b,kind,classification, invariant, evidence=None):
        if a==b:
            return
        producer=primary.get(a)
        consumer=reads.get(b)
        if a in {'V102','V103'} and b in {'V101','V103','V105','V106'}:
            consumer='contratantes'
        if a=='V106' and b.startswith('V1') and b not in {'V101','V102','V103','V104','V105','V123'}:
            consumer='contratos'
        evidence = evidence or [anchor(a,producer),anchor(b,consumer)]
        if kind=='dados_esperados' and a=='SYS04':
            evidence[0]=localref(byid[a]['entrada'],'definirPreferenciaOrganizacao(')
            producer='preferencia_de_organizacao_selecionada'
        if kind=='dados_esperados' and a=='ADM01' and b not in {'SYS04','SYS05'}:
            evidence[1]=localref('src/lib/administracao/rbacRpc.ts','chamar("consultar_permissoes_efetivas"')
            consumer='consultar_permissoes_efetivas (infraestrutura compartilhada)'
        row={'origem':a,'destino':b,'tipo':kind,'classe':classification,
             'invariante':invariant,'evidencias':evidence,'runtime':'NAO_EXECUTADO_FASE1',
             'produtor_referencia':producer, 'consumidor_referencia':consumer,
             'chaves_a_preservar':['id_organizacao','id_contrato','id_competencia','versao/hash/contexto conforme domínio']}
        if not any(all(e[k]==row[k] for k in ('origem','destino','tipo','invariante')) for e in edges):
            edges.append(row)

    paths = {s['rota']:s['id'] for s in screens if s['id']!='V117'}
    for s in screens:
        for p in s['dependencias_modulo']:
            text=ler(root,p)
            for m in re.finditer(r'(?:\bto\s*[:=]\s*|\bdestino\s*:\s*)["\'](/[^"\']*)',text):
                if m[1] in paths:
                    edge(s['id'],paths[m[1]],'navegacao_literal','CONDICIONAL',
                         'Destino presente no código; sessão, contexto e autorização condicionam a execução.',[ref(p,text,m.start())])

    # Sidebar compartilhada: seus alvos contextualizados não são literais de rota completos.
    menu='src/lib/navegacao/menuV1.ts'
    for s in screens:
        if s['id'] in {'SYS01','SYS02','SYS03','SYS04'}:
            continue
        for target in ['SYS05','V101','V102','V104','V105','SYS04','ADM01','V123']:
            declaration=(localref('src/components/layout/ContaOSSidebar.tsx','to="/selecionar-organizacao"') if target=='SYS04'
                         else localref(menu,'destino: "'+byid[target]['rota']+'"'))
            edge(s['id'],target,'menu_compartilhado','CONDICIONAL',
                 'Menu comum/admin condicionado às permissões backend; organizações pelo AppShell.',
                 [declaration])
        contexts = list(range(6,14))+[21,22] if s['rota'].startswith('/contratos/$id') else list(range(14,20)) if s['rota'].startswith('/competencias/') else []
        for i in contexts:
            if i!=17:
                edge(s['id'],f'V1{i:02}','menu_contextual','CONDICIONAL',
                     'Mesmo contrato/competência resolvido pelo backend; ação autorizada e contexto atual.',[ref(menu,ler(root,menu),ler(root,menu).index('menuContextualV1'))])
        if s['rota'].startswith('/competencias/'):
            edge(s['id'],'V106','menu_contextual','CONDICIONAL',
                 'Contrato da competência resolvido pelo backend; exige id_contrato e permissão consultar contratos.',
                 [localref(menu,'if (c.contrato) adicionar("Contrato da competência"'),
                  localref('src/lib/administracao/rbacRpc.ts','.from("competencias")')])
    edge('V116','V117','drawer','OBRIGATORIA','Requisito selecionado pertence à mesma competência e execução de análise.',
         [ref(byid['V116']['entrada'],ler(root,byid['V116']['entrada']),ler(root,byid['V116']['entrada']).index('RequirementDrawer'))])
    edge('V117','V116','drawer','OBRIGATORIA','Fechar drawer retorna à mesma análise sem perder contexto.')

    semantic = [
      ('SYS01',['SYS04','SYS05'],'Sessão autenticada e destino pós-login resolvido por organizações disponíveis.'),
      ('SYS04',[s['id'] for s in screens if s['id'] not in {'SYS01','SYS02','SYS03','SYS04'}],'id_organizacao selecionado é preferência de navegação, nunca autorização; consultas confirmam escopo backend.'),
      ('ADM01',[s['id'] for s in screens if s['id'] not in {'SYS01','SYS02','SYS03','ADM01'}],'Vínculo/perfil/escopo e matriz RBAC devem refletir-se em permissões efetivas, sem conceder papel humano especializado ao MASTER.'),
      ('V102',['V101','V103','V105'],'Mesmo registro contratantes.id/id_organizacao aparece na lista, edição e seleção do novo contrato.'),
      ('V103',['V101','V104','V105','V106'],'Edição do contratante mantém ID, organização e referências dos contratos; respeitar versao_registro.'),
      ('V105',['V104','V106'],'Contrato criado preserva id_organizacao e id_contratante, visível na lista e visão geral.'),
      ('V106',[f'V1{i:02}' for i in range(7,14)]+['V121','V122'],'Mesmo contratos.id e id_organizacao; alteração cadastral/situação não pode criar outro contrato nem perder vínculos.'),
      ('V107',['V109','V113','V116','V117','V118','V119'],'Fonte/versão/aplicabilidade aprovadas e vigência devem manter origem e hash; não inventar obrigação.'),
      ('V108',['V116','V118','V119'],'Proposta/versão/linhas pertencem ao contrato; alteração material exige contexto/análise atualizados.'),
      ('V109',['V113','V114','V115','V116','V117'],'Lista/versão/item aplicável materializa requisitos da competência, mantendo fonte e vigência.'),
      ('V110',['V111','V116'],'Documento e versão do contrato permanecem ligados ao mesmo arquivo/hash; análise usa somente dados elegíveis.'),
      ('V111',['V110','V107','V116','V117'],'Nova versão e revisão de extração preservam a anterior, fonte/página/trecho e invalidam contexto material quando aplicável.'),
      ('V113',['V112','V114','V115','V116','V118','V119','V120'],'Competência criada pertence ao contrato; conservar competencias.id/id_contrato/id_organizacao em todas as etapas.'),
      ('V115',['V114','V116','V117','V118','V119'],'Documento da competência/versão/requisito conserva escopo; substituição material invalida portão e exige reanálise.'),
      ('V116',['V114','V117','V118','V119'],'Execução/resultados/evidências vinculados à competência, sem reaproveitar hash/contexto obsoleto.'),
      ('V117',['V114','V116','V118','V119'],'Revisão humana/reanálise do requisito conserva evidências, justificativa, versão e execução atual.'),
      ('V118',['V114','V119'],'Parecer aprovado pertence à competência e contexto atuais; 100% dos impeditivos continuam necessários.'),
      ('V119',['V114','V120'],'Apresentação aprovada/registrada produz pacote imutável, hash e protocolo da mesma competência; comando idempotente.'),
      ('V122',['V121','V116','V117'],'Relatório/apontamento/resposta/desfecho preservam origem; histórico do próprio contrato só produz regra material após governança.'),
      ('V105',['SYS05'],'Contrato criado altera totais de contratos visíveis/ativos no resumo da mesma organização.'),
      ('V106',['SYS05'],'Mudança material do contrato/situação reflete totais e agrupamentos autorizados do painel, sem cache contraditório.'),
      ('V113',['SYS05'],'Competência criada reflete contadores, agrupamentos e prazos do resumo da organização.'),
    ]
    for a,targets,invariant in semantic:
        for b in targets:
            edge(a,b,'dados_esperados','OBRIGATORIA',invariant)
    for a in ['SYS04','ADM01','V102','V103','V105','V106','V107','V108','V109','V110','V111','V113','V115','V116','V117','V118','V119','V122']:
        edge(a,'V123','auditoria_esperada','CONDICIONAL','Ação material deve produzir evento rastreável no escopo autorizado; verificar conteúdo e correlation/request ID nas fases 3–6.')
    edges.sort(key=lambda e:(e['origem'],e['destino'],e['tipo'],e['invariante']))
    for i,e in enumerate(edges,1):
        e['id']=f'C{i:04}'
        e['fases_validacao'] = [2] if e['tipo'] in {'navegacao_literal','menu_compartilhado','menu_contextual','drawer'} else [3,4,5,6]
    pairs=[]
    for a in screens:
        for b in screens:
            if a['id']==b['id']:
                continue
            found=[e['id'] for e in edges if (e['origem'],e['destino'])==(a['id'],b['id'])]
            pairs.append({'origem':a['id'],'destino':b['id'],'conexoes':found,
                          'classe':'MAPEADA' if found else 'NA_LIGACAO_DIRETA',
                          'motivo': 'Ver conexões e invariantes.' if found else 'Nenhum salto direto exigido neste mapa; relação indireta por contrato/competência/organização continua aplicável. Não significa fluxo E2E não aplicável.'})
    allfiles=set(fontes_app(root)) | {'src/routeTree.gen.ts','src/integrations/supabase/types.ts','scripts/testc/visual-audit.mjs','scripts/hml/authenticated-visual-audit.mjs'}
    sources=[{'arquivo':p,'sha256':sha((root/p).read_bytes()),'git_blob':subprocess.check_output(['git','hash-object',p],cwd=root,text=True).strip()} for p in sorted(allfiles)]
    queries=[]
    for p in fontes_app(root):
        text=ler(root,p)
        for m in re.finditer(r'queryKey\s*:|(?:invalidateQueries|resetQueries|removeQueries|refetchQueries|refetch|clear)\s*\(',text):
            queries.append(ref(p,text,m.start()))
    shared=[]
    for entry in ['src/components/layout/ContaOSAppShell.tsx','src/components/layout/ContaOSOrganizationHeader.tsx','src/components/copiloto/CopilotoContrato.tsx','src/components/cadastros/GerenciarCadastro.tsx','src/components/contratos/GerenciarListas.tsx']:
        deps=fechamento(root,entry)
        shared.append({'entrada':entry,'dependencias_modulo':deps,
                       'operacoes_indices':[i for i,o in enumerate(operations) if o['arquivo'] in deps],
                       'escopo':'Superfície embutida/compartilhada; não constitui nova rota. Renderização depende de sessão, contexto e autorização.'})
    resources=[]
    for name in sorted({o['nome'] for o in operations if o['tipo']=='rpc_referencia'}):
        resources.append({'nome':name,'definicoes_normativas':rpc[name],
                          'observacao':'Definições versionadas, podendo incluir wrapper público e implementação privada; não comprova deployment atual.'})
    ctx=json.loads(ler(root,'docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json'))
    for d in ctx['context_documents']:
        actual=subprocess.check_output(['git','hash-object',d['path']],cwd=backend,text=True).strip() if backend else d['blob_sha']
        if actual!=d['blob_sha']:
            raise ValueError('Drift fonte normativa: '+d['path'])
    if resources!=trusted:
        raise ValueError('Referências RPC divergem do catálogo normativo independente')
    data={'schema':'contaos.integracao-funcional-v1.fase1.v1','baseline_frontend':BASE,'baseline_backend':BACK,
          'ambiente':'HML gklhhhyosgasnyoxlrui','tipo_prova':'ESTATICA_SEM_SESSAO_SEM_MUTACAO',
          'decisao':'PASS_INVENTARIO_E_MAPA_CONDICIONADO_A_CI_E_MERGE',
          'metodo':'Fechamento conservador de imports; referências RPC incluem nomes em contratos tipados/dispatch. Dependência de módulo não prova chamada ou fluxo executado.',
          'contagem':{'nucleo':27,'auxiliares_recuperacao':2,'superficies_reais':29,'rotas_distintas':28,'privadas':26},
          'reconciliacao':'27 = 23 V1 + SYS01 + SYS04 + SYS05 + ADM01. SYS02/SYS03 são auxiliares igualmente inventariadas. Catálogo real contém 29 superfícies/28 rotas; PRIVATE_SURFACES tem 26, não 27. Certificações antigas preservadas sem atribuir execução nova.',
          'ressalvas':{'R-01':'upload físico E2E/arquivo grande e retomada','R-02':'worker/filas E2E em fluxo integral','R-03':'isolamento real multiusuário/organização em todos os domínios'},
          'contexto_normativo':ctx,'telas':screens,'operacoes':operations,'recursos_rpc':resources,
          'consultas_e_atualizacao':queries,'compartilhadas':shared,'conexoes':edges,'pares':pairs,'fontes':sources}
    return data


def validar(root, data):
    errors=[]
    def check(ok,msg):
        if not ok:
            errors.append(msg)
    try:
        fresh=gerar(root)
    except (ValueError,OSError,KeyError) as e:
        return ['Expectativas independentes indisponíveis: '+str(e)]
    # Não derivar a expectativa da entrada submetida: reconstruir pelo catálogo
    # normativo fixado e pelo código real. Rejeita remoções coordenadas.
    for key in ['telas','operacoes','recursos_rpc','consultas_e_atualizacao','compartilhadas','conexoes','pares','fontes','contexto_normativo']:
        check(data.get(key)==fresh[key],'Divergência da reconstrução independente: '+key)
    check(data.get('tipo_prova')=='ESTATICA_SEM_SESSAO_SEM_MUTACAO','Tipo de prova inválido')
    check(data.get('baseline_frontend')==BASE and data.get('baseline_backend')==BACK,'Baseline inválida')
    screens=data.get('telas',[])
    check({s['id'] for s in screens}==set(CORE+['SYS02','SYS03']) and len(screens)==29,'Inventário incompleto/duplicado')
    expected=dict(catalogo(root))
    check(all(expected.get(s['id'])==s['rota'] for s in screens),'Rota incorreta')
    check(sum(s['nucleo_27'] for s in screens)==27,'Núcleo não contém 27 telas')
    check({s['id'] for s in screens if s['nucleo_27']}==set(CORE),'Núcleo com IDs incorretos')
    for f in data.get('fontes',[]):
        p=root/f['arquivo']
        check(p.is_file() and sha(p.read_bytes())==f['sha256'],'Hash divergente: '+f['arquivo'])
    expectedfiles=set(fontes_app(root))|{'src/routeTree.gen.ts','src/integrations/supabase/types.ts','scripts/testc/visual-audit.mjs','scripts/hml/authenticated-visual-audit.mjs'}
    check({f['arquivo'] for f in data.get('fontes',[])}==expectedfiles,'Cobertura de fontes incompleta')
    rpc={r['nome'] for r in data.get('recursos_rpc',[])}
    check(data.get('operacoes')==operacoes(root,rpc),'Operações omitidas ou alteradas')
    ids={s['id'] for s in screens}
    es=data.get('conexoes',[])
    check(len({e.get('id') for e in es})==len(es),'ID de conexão duplicado')
    for e in es:
        check(e['origem'] in ids and e['destino'] in ids,'Conexão sem tela')
        check(e['classe'] in {'OBRIGATORIA','CONDICIONAL'},'Classe inválida')
        check(e['runtime']=='NAO_EXECUTADO_FASE1','PASS runtime fabricado')
        check(bool(e.get('invariante')) and bool(e.get('evidencias')),'Conexão sem invariante/evidência')
        for r in e.get('evidencias',[]):
            lines=ler(root,r['arquivo']).splitlines()
            check(0<r['linha']<=len(lines) and lines[r['linha']-1].strip()==r['trecho'],'Âncora divergente')
    pairs=data.get('pares',[])
    check(len(pairs)==29*28 and {(p['origem'],p['destino']) for p in pairs}=={(a,b) for a in ids for b in ids if a!=b},'Matriz de pares incompleta')
    for p in pairs:
        found=[e['id'] for e in es if (e['origem'],e['destino'])==(p['origem'],p['destino'])]
        check(p['conexoes']==found,'Pares e conexões divergentes')
    for s in screens:
        check((root/s['arquivo_rota']).is_file(),'Arquivo de rota inexistente')
        check(s['dependencias_modulo']==fechamento(root,s['entrada']),'Dependências incorretas: '+s['id'])
        expectedops=[i for i,o in enumerate(data.get('operacoes',[])) if o['arquivo'] in s['dependencias_modulo']]
        check(s['operacoes_indices']==expectedops,'Recursos por tela divergentes: '+s['id'])
        check(any(e['origem']==s['id'] or e['destino']==s['id'] for e in es),'Tela sem conexão mapeada: '+s['id'])
    check(subprocess.check_output(['git','hash-object','src/integrations/supabase/types.ts'],cwd=root,text=True).strip()=='8ea7750b75fd9d76b29c36ce7613392e3ab65e19','LOCK-TYPES-01')
    return sorted(set(errors))


def vistas_csv(data):
    result={}
    out=io.StringIO(newline='')
    w=csv.writer(out,lineterminator='\n')
    w.writerow(['id','nucleo_27','nome','rota','componente','arquivo_rota','entrada','tabelas_diretas_modulos','rpc_referenciadas_modulos','edges_referenciadas_modulos','auth','runtime'])
    for s in data['telas']:
        ops=[data['operacoes'][i] for i in s['operacoes_indices']]
        def names(prefix):
            return ';'.join(sorted({o['nome'] for o in ops if o['tipo'].startswith(prefix)}))
        w.writerow([s['id'],s['nucleo_27'],s['nome'],s['rota'],s['componente'],s['arquivo_rota'],s['entrada'],names('tabela'),names('rpc'),names('edge'),names('auth'),s['runtime']])
    result['TELAS.csv']=out.getvalue()
    out=io.StringIO(newline='')
    w=csv.writer(out,lineterminator='\n')
    w.writerow(['id','origem','destino','tipo','classe','invariante','produtor_referencia','consumidor_referencia','fases_validacao','evidencias','runtime'])
    for e in data['conexoes']:
        w.writerow([e['id'],e['origem'],e['destino'],e['tipo'],e['classe'],e['invariante'],e['produtor_referencia'],e['consumidor_referencia'],','.join(map(str,e['fases_validacao'])),';'.join(f"{r['arquivo']}:{r['linha']}" for r in e['evidencias']),e['runtime']])
    result['CONEXOES.csv']=out.getvalue()
    return result


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--gerar',type=Path)
    parser.add_argument('--verificar',action='store_true')
    args=parser.parse_args()
    if args.gerar:
        data=gerar(ROOT,args.gerar.resolve())
        errors=validar(ROOT,data)
        if errors:
            raise ValueError(errors)
        (HERE/'inventario.json').write_text(json.dumps(data,ensure_ascii=False,indent=1)+'\n')
        for name,contents in vistas_csv(data).items():
            (HERE/name).write_text(contents)
    else:
        data=json.loads((HERE/'inventario.json').read_text())
        errors=validar(ROOT,data)
        for name,contents in vistas_csv(data).items():
            if not (HERE/name).is_file() or (HERE/name).read_text()!=contents:
                errors.append('Vista CSV divergente: '+name)
        if errors:
            print(json.dumps({'resultado':'FAIL','erros':errors},ensure_ascii=False))
            raise SystemExit(1)
    print(json.dumps({'resultado':'PASS_ESTATICO','telas_nucleo':27,'superficies':len(data['telas']),
                      'conexoes':len(data['conexoes']),'pares':len(data['pares']),
                      'fontes':len(data['fontes']),'referencias_dados':len(data['operacoes'])},ensure_ascii=False))


if __name__=='__main__':
    main()

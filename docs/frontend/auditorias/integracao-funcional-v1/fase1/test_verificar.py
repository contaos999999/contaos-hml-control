"""Negativos do selo documental; não exercem nem substituem o produto HML."""
import copy
import json
from pathlib import Path
import unittest
import sys

sys.dont_write_bytecode = True

import verificar


class GateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = Path(__file__).resolve().parents[5]
        cls.data = json.loads(Path(__file__).with_name('inventario.json').read_text()) if Path(__file__).with_name('inventario.json').exists() else {}

    def check(self, data):
        return verificar.validar(self.root, data)

    def test_inventario_real_completo(self):
        self.assertEqual(self.check(self.data), [])

    def test_tela_removida_bloqueia(self):
        d = copy.deepcopy(self.data)
        d['telas'].pop()
        self.assertTrue(self.check(d))

    def test_rota_inventada_bloqueia(self):
        d = copy.deepcopy(self.data)
        d['telas'][0]['rota'] = '/rota-inventada'
        self.assertTrue(self.check(d))

    def test_evidencia_adulterada_bloqueia(self):
        d = copy.deepcopy(self.data)
        d['fontes'][0]['sha256'] = '0' * 64
        self.assertTrue(self.check(d))

    def test_rpc_omitida_bloqueia(self):
        d = copy.deepcopy(self.data)
        d['operacoes'] = [o for o in d['operacoes'] if o['nome'] != 'criar_competencia']
        self.assertTrue(self.check(d))

    def test_conexao_sem_destino_bloqueia(self):
        d = copy.deepcopy(self.data)
        d['conexoes'][0]['destino'] = 'V199'
        self.assertTrue(self.check(d))

    def test_par_omitido_bloqueia(self):
        d = copy.deepcopy(self.data)
        d['pares'].pop()
        self.assertTrue(self.check(d))

    def test_pass_runtime_fabricado_bloqueia(self):
        d = copy.deepcopy(self.data)
        d['conexoes'][0]['runtime'] = 'PASS'
        self.assertTrue(self.check(d))

    def test_menu_competencia_retorna_contrato(self):
        for sid in ['V114','V115','V116','V117','V118','V119','V120']:
            self.assertTrue(any(e['origem']==sid and e['destino']=='V106' and e['tipo']=='menu_contextual' for e in self.data['conexoes']),sid)

    def test_join_contratante_no_detalhe(self):
        s=next(s for s in self.data['telas'] if s['id']=='V106')
        self.assertTrue(any(self.data['operacoes'][i]['nome']=='contratantes' for i in s['operacoes_indices']))

    def test_edicao_contratante_reflete_detalhe(self):
        self.assertTrue(any(e['origem']=='V103' and e['destino']=='V106' and e['tipo']=='dados_esperados' for e in self.data['conexoes']))

    def test_mutacoes_alimentam_painel(self):
        for sid in ['V105','V106','V113']:
            self.assertTrue(any(e['origem']==sid and e['destino']=='SYS05' and e['tipo']=='dados_esperados' for e in self.data['conexoes']),sid)

    def test_remover_todas_relacoes_dados_bloqueia(self):
        d=copy.deepcopy(self.data)
        d['conexoes']=[e for e in d['conexoes'] if e['tipo']!='dados_esperados']
        ids={e['id'] for e in d['conexoes']}
        for p in d['pares']:
            p['conexoes']=[x for x in p['conexoes'] if x in ids]
        self.assertTrue(self.check(d))

    def test_catalogo_rpc_removido_bloqueia(self):
        d=copy.deepcopy(self.data)
        d['recursos_rpc']=[]
        d['operacoes']=[o for o in d['operacoes'] if o['tipo']!='rpc_referencia']
        for s in d['telas']+d['compartilhadas']:
            s['operacoes_indices']=[i for i,o in enumerate(d['operacoes']) if o['arquivo'] in s['dependencias_modulo']]
        self.assertTrue(self.check(d))

    def test_componente_errado_bloqueia(self):
        d=copy.deepcopy(self.data)
        d['telas'][0]['componente']='Inexistente'
        self.assertTrue(self.check(d))

    def test_arquivo_rota_errado_bloqueia(self):
        d=copy.deepcopy(self.data)
        d['telas'][0]['arquivo_rota']='src/routes/index.tsx'
        self.assertTrue(self.check(d))

    def test_runtime_tela_fabricado_bloqueia(self):
        d=copy.deepcopy(self.data)
        d['telas'][0]['runtime']='PASS_REAL'
        self.assertTrue(self.check(d))

    def test_definicao_rpc_removida_bloqueia(self):
        d=copy.deepcopy(self.data)
        d['recursos_rpc'][0]['definicoes_normativas']=[]
        self.assertTrue(self.check(d))

    def test_classe_par_inventada_bloqueia(self):
        d=copy.deepcopy(self.data)
        d['pares'][0]['classe']='IGNORAR'
        d['pares'][0]['motivo']=''
        self.assertTrue(self.check(d))


if __name__ == '__main__':
    unittest.main()

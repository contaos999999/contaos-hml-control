# SYS-01 — Login: relatório de teste (somente leitura)

Data: 02/11/2026 · HML `gklhhhyosgasnyoxlrui`. Nenhum arquivo de código, banco, configuração ou documentação foi alterado.

| # | Item | Resultado | Evidência |
|---|---|---|---|
| 1 | Rota abre | PASS | `/login` responde 200 e mostra o título "Bem-vindo de volta" |
| 2 | Perfil autorizado funciona | BLOQUEADO/PENDENTE | Não há usuário de teste HML; este Supabase não permite gerar sessão de teste automática |
| 3 | Não autorizado bloqueado pelo backend | PASS parcial · PENDENTE | Sem login, leitura direta de `vinculos_usuarios` retornou 401 `permission denied` e tentativa de alteração retornou 401. Usuário logado sem vínculo: PENDENTE (sem credencial) |
| 4 | Loading / empty / error | PASS parcial · PENDENTE | Validação, botão "Entrando…" desabilitado, erro de credencial e erro de rede (offline) confirmados no navegador. "Sem acesso" e "erro ao carregar acessos" só nos testes automáticos (sem usuário real) |
| 5 | Nenhuma request usa secret key | PASS | Requisições ao Supabase usam somente a chave `sb_publishable_…`; busca no código sem `service_role`/`sb_secret_` |
| 6 | Nenhuma ação crítica por update direto | PASS | O login só faz `signInWithPassword` e leitura; nenhum update/insert/delete/rpc no código do login |
| 7 | Desktop 1440 e 1280 | PASS | Sem rolagem horizontal; formulário e "Acesso protegido" visíveis |
| 8 | Tablet 768 | PASS | Faixa superior compacta; sem rolagem horizontal |
| 9 | Mobile 390 preserva dados críticos | PASS | Formulário, selo de homologação e "Acesso protegido" visíveis; sem rolagem horizontal |
| 10 | Teclado / foco / labels | PASS | Tab → e-mail; Tab×3 → botão do olho; Enter alterna; tooltip por foco e hover; labels visíveis associados |
| 11 | Console sem erro e sem log sensível | PASS com ressalva | Nenhum log da aplicação nem dado sensível. Há 4 linhas "Failed to load resource" geradas pelo navegador nos testes negativos forçados (400 senha errada, 401 das sondagens, offline) |
| 12 | Security scan sem novo Critical | PASS | Nenhum achado ligado ao SYS-01. Existem 4 alertas de nível alto pré-existentes no backend certificado (leitura ampla em `configuracao_api`, `configuracao_localizacao`, `configuracao_upload`, `perfis_usuarios`) e 3 informativos — fora do escopo, não corrigidos |

## Conclusão
Itens 2, 3 (parte logada) e 4 (parte "sem acesso") estão BLOQUEADOS por falta de credencial HML válida. Para concluir: fornecer um usuário HML com vínculo e um sem vínculo. Não avancei para o próximo número.

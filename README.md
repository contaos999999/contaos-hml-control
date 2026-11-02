# ContaOS HML Control

PROJETO: ContaOS HML

MODO: PLAN. NÃO ALTERE CÓDIGO NEM BANCO.
Este é o ContaOS. Arquitetura oficial: frontend Lovable/React/TypeScript + backend Supabase próprio conectado ao projeto.
Regras absolutas:
1. Supabase é a única fonte de verdade.
2. Toda tabela de negócio exposta usa RLS e grants mínimos.
3. O frontend nunca recebe secret key, senha de banco ou chave privada.
4. CRUD simples pode usar Data API com RLS.
5. Transições críticas usam RPC/Database Function ou Edge Function autenticada.
6. PODE APRESENTAR AO CONTRATANTE somente com 100,00% dos requisitos obrigatórios e aplicáveis conformes.
7. PODE REAPRESENTAR AO CONTRATANTE somente com 100% dos apontamentos da rodada tratados.
8. VALIDADA somente após parecer final favorável do contratante.
9. Alerta histórico transversal de outro contrato é informativo e não integra o portão de 100% por si só.
10. Documentos não são sobrescritos; nova correção = nova versão.
11. IA não cria obrigação sem fonte, escopo e aprovação humana.
12. Uma tarefa não pode alterar área fora do escopo.
13. Se precisar de algo não autorizado, PARE e explique.
Responda apenas com um resumo dessas regras e diga se o Supabase conectado é o projeto HML. Não implemente nada.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b113dd59-6caf-4c92-8302-457a037a0c6f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

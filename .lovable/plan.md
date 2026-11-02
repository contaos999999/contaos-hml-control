# SYS-03 — Condição de corrida do PASSWORD_RECOVERY (investigação + correção mínima proposta)

## Diagnóstico (lido em @supabase/auth-js 2.118.0, GoTrueClient.js)

```text
import client.ts  -> createClient -> constructor -> initialize()            (síncrono no import)
  _initialize(): parseParametersFromURL(href) -> implicit (access_token + type=recovery)
  _getSessionFromURL(): await _getUser(access_token)   (rede, ~100–500 ms)
                       window.location.hash = ''       (linha 3334: hash LIMPO)
  _saveSession(session)
  setTimeout(0) -> _notifyAllSubscribers('PASSWORD_RECOVERY')   (linhas 422–428, disparo ÚNICO)
onAuthStateChange(cb) registrado depois -> recebe só INITIAL_SESSION (com a sessão já salva),
                                           nunca o PASSWORD_RECOVERY já emitido
```

1. **O evento pode acontecer antes da inscrição: SIM.** O cliente é criado quando o módulo é importado (o import de `ResetPasswordForm` puxa `client.ts`). Já a inscrição atual só acontece no `useEffect`, depois do SSR, da hidratação e do commit do React. O `PASSWORD_RECOVERY` é emitido uma única vez, sem replay, logo após a resposta do `_getUser`. Se a rede for mais rápida que a hidratação, o evento se perde. Uma inscrição tardia recebe só `INITIAL_SESSION`, que o componente ignora de propósito. O resultado bate com o observado: a sessão foi criada às 10:48:08, o formulário não abriu, a tela caiu em "link inválido" após 3 s e não houve `updateUser` nem logout.
2. **O hash preserva `type=recovery` depois da inicialização: NÃO.** A linha 3334 faz `window.location.hash = ''`, apagando tudo, inclusive `type`. Depois disso só sobra a sessão salva no storage, idêntica a uma sessão comum.
3. **Risco secundário:** se o `_getUser` passar de 3 s, o timeout mostra "inválido" e o evento que chega depois é descartado (só sai de `verificando`).

## Correção mínima proposta (somente `src/components/auth/ResetPasswordForm.tsx`)

- **Captura no nível do módulo:** uma inscrição única em `supabase.auth.onAuthStateChange`, registrada no corpo do módulo, logo após os imports. Sem `useEffect` e só no navegador (`typeof window !== "undefined"`).
  - Ela guarda uma flag interna `recuperacaoDetectada = true` quando chega `PASSWORD_RECOVERY`, e `false` quando chega `SIGNED_OUT`.
  - Ela notifica os componentes montados por um pequeno conjunto de ouvintes.
- **Por que funciona:** os imports ESM são avaliados de forma síncrona e em ordem. Logo, essa inscrição fica registrada antes de o `initialize()` terminar a chamada de rede. Sem top-level await, o evento não tem como chegar antes dela.
- **No componente:** ao montar, se a flag já estiver `true`, o formulário é liberado na hora. Caso contrário, o componente assina o conjunto de ouvintes. Ficam mantidos:
  - o tratamento imediato de hash/query com erro;
  - o timeout de 3 s;
  - a regra de liberar **somente** por `PASSWORD_RECOVERY`.
- Sem `getSession()`. Nenhuma sessão comum libera o formulário. Sem leitura de token. Mesmo cliente existente. Sem segundo cliente. Nada de backend, Auth config, RLS ou `client.ts`.
- **Depois do sucesso:** o `signOut` já existente dispara `SIGNED_OUT` e zera a flag. Também zerar a flag de forma explícita após o sucesso.
- **Fora do escopo:** o ajuste do timeout com rede lenta (item 3) fica fora da correção mínima. Ele exige uma decisão de produto e fica registrado como risco.

## Teste RED proposto (somente `src/test/resetPassword.test.tsx`)

- **"PASSWORD_RECOVERY emitido antes da montagem libera o formulário":**
  - importar o módulo, que registra a inscrição no mock;
  - emitir `PASSWORD_RECOVERY` pelo callback capturado **antes** de `render`;
  - renderizar, avançar 3100 ms e esperar o campo "Nova senha" visível, sem "link inválido".
  - Hoje falha: só há inscrição no `useEffect` e o evento já passou.
- **Ajuste no mock:** guardar **todos** os callbacks (array), não só o último, e resetar a flag entre testes por meio de um export de teste (`__resetRecuperacaoParaTeste`) ou `vi.resetModules()`.
- **Regressões que precisam continuar verdes:**
  - `SIGNED_IN` antes ou depois da montagem não libera;
  - `getSession` com sessão comum não libera;
  - hash `otp_expired` mostra inválido na hora;
  - `SIGNED_OUT` após `PASSWORD_RECOVERY` zera a flag, e uma nova montagem não libera;
  - senha curta é enviada e `weak_password` mostra a mensagem `fraca`.

## Verificação após o build aprovado

- Rodar o teste do SYS-03, a suíte completa, o typecheck e o build.
- Testar no navegador sem token e com hash expirado.
- Pedir um novo link real, que o dono da caixa abre: o formulário deve aparecer, a troca deve ser concluída e deve haver logout.
- Conferir que o `git diff` ficou restrito aos 2 arquivos.

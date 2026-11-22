// P0-CERT-LIVE-001: gate de elegibilidade sem autenticação operacional.
// Não substitui auditoria de CI/PR/sha, nem certifica automaticamente qualquer versão.
export const CERTIFICACAO_CODIGO = "CERTIFICACAO_CODIGO";
export const GATE_PROD_LIVE = "GATE_PROD_LIVE";
export function avaliarGateP0({ etapa, versoes, codigo, live } = {}) {
  if (![CERTIFICACAO_CODIGO, GATE_PROD_LIVE].includes(etapa))
    return { status: "NO_GO", motivo: "ETAPA_INVALIDA" };
  if (!codigo || codigo.ci !== true || codigo.seguranca !== true ||
      codigo.regressao !== true || codigo.revisao_independente !== true ||
      codigo.sha_integrado !== true)
    return { status: "NO_GO", motivo: "EVIDENCIA_CODIGO_INCOMPLETA" };
  if (etapa === CERTIFICACAO_CODIGO)
    return { status: "ELEGIVEL_A_CERTIFICACAO", live: "DIFERIDO_PARA_GATE_PROD" };
  const completas = ["V1", "V2", "V3", "V4", "V5"].every(v =>
    versoes?.[v]?.status === "PASS" && versoes[v].sha_integrado === true);
  if (!completas) return { status: "NO_GO", motivo: "VERSOES_INCOMPLETAS" };
  if (live?.autenticado !== true || live?.hml !== true ||
      live?.isolamento_rls !== true || live?.artefatos_verificados !== true ||
      live?.revisao_independente !== true)
    return { status: "NO_GO", motivo: "CONTRAPROVAS_LIVE_INCOMPLETAS" };
  return { status: "ELEGIVEL_A_REVISAO_GATE_PROD", autorizacao_prod: false };
}

import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const P0 = "docs/frontend/governanca/P0_ORDEM_POR_VERSAO_4_1.json";
const PLAN = "docs/frontend/planos/PLANO_ATIVO.json";
const seq = (a, b, digits) =>
  Array.from({ length: b - a + 1 }, (_, i) => String(a + i).padStart(digits, "0"));
const same = (a, b) =>
  Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
const sha40 = (s) => typeof s === "string" && /^[a-f0-9]{40}$/.test(s);
const expectCerts = ["V1", "V2", "V3", "V4", "V5", "GLOBAL"];
const safePrefix = (seen, expected) =>
  Array.isArray(seen) &&
  new Set(seen).size === seen.length &&
  seen.every((id, i) => id === expected[i]);

const integrationVersions = ["V1", "V2", "V3", "V4", "V5"];
const reqKeys = ["interna", "cumulativa"];
const prReview = (s) =>
  typeof s === "string" &&
  /^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/pull\/\d+#pullrequestreview-\d+$/.test(s);
const ciRun = (s) =>
  typeof s === "string" &&
  /^https:\/\/github\.com\/contaos999999\/contaos-hml-control\/actions\/runs\/\d+$/.test(s);
const validEvidencePath = (s, ext) =>
  typeof s === "string" &&
  /^docs\/frontend\/auditorias\/[a-zA-Z0-9_./-]+$/.test(s) &&
  !s.split("/").includes("..") &&
  ext.test(s);

/**
 * Portão P0 de integração interna/cumulativa. Checa recibos estruturais e sua
 * existência local no SHA do CI; a autenticidade externa de PR/review/CI requer
 * auditoria humana independente e readback de GitHub, não é presumida aqui.
 */
export function validateIntegrationReceipts(m, plan, changed = [], fileExists = existsSync) {
  const errors = [];
  const err = (msg) => errors.push(msg);
  const policy = m?.controle?.integracao_por_versao;
  if (policy?.schema !== "contaos.p0.integracao-acumulada.v1" ||
      m?.restricoes?.integracao_interna_e_cumulativa_obrigatoria !== true) {
    err("P0 INTEGRACAO: protocolo cumulativo ausente ou enfraquecido.");
    return errors;
  }
  const statuses = m?.controle?.certificados_por_versao || {};
  for (const [i, version] of integrationVersions.entries()) {
    const block = policy[version];
    if (!block || typeof block !== "object") {
      err("P0 INTEGRACAO: bloco ausente " + version);
      continue;
    }
    if (i === 0 && block.cumulativa !== "BASE_FUNDACIONAL")
      err("P0 INTEGRACAO: V1 deve manter base fundacional sem certificado cumulativo ficticio.");
    for (const kind of i === 0 ? ["interna"] : reqKeys) {
      const receipt = block[kind];
      if (!receipt || !["PENDENTE", "NO_GO", "PASS"].includes(receipt.status)) {
        err("P0 INTEGRACAO: recibo " + version + "/" + kind + " ausente/invalido.");
        continue;
      }
      if (receipt.status !== "PASS") continue;
      // O certificado final da fase7 não pode ser substituído pelo inventário
      // estático da fase1, nem por artefato de outra versão ou outro escopo.
      const prefix = "docs/frontend/auditorias/" +
        (kind === "interna" ? "integracao-funcional-" : "integracao-cumulativa-v1-") +
        version.toLowerCase() + "/";
      const expected = [
        ["arquivo_evidencia", /\.md$/, prefix + "fase7/"],
        ["matriz_arquivo", /\.(json|csv)$/, prefix],
        ["grafo_arquivo", /\.(mmd|json)$/, prefix],
      ];
      const validPaths = expected.every(([key, ext, scope]) =>
        typeof receipt[key] === "string" &&
        receipt[key].startsWith(scope) &&
        validEvidencePath(receipt[key], ext) &&
        fileExists(receipt[key]));
      if (!sha40(receipt.pr_merge_sha) || !ciRun(receipt.ci_url) ||
          !prReview(receipt.revisao_independente_url) || !validPaths)
        err("P0 INTEGRACAO: " + version + "/" + kind +
          " PASS sem PR/merge, CI, revisao independente ou certificado final fase7 com escopo e proveniencia corretos, matriz e grafo verificaveis.");
      if (statuses[version]?.status !== "PASS")
        err("P0 INTEGRACAO: " + version + "/" + kind + " antecipado ao certificado funcional.");
      if (kind === "cumulativa" && block.interna?.status !== "PASS")
        err("P0 INTEGRACAO: certificado cumulativo " + version + " sem integracao interna PASS.");
    }
  }
  const eligible = (id) => {
    const ix = integrationVersions.findIndex((v) => {
      const b = m?.blocos?.find((entry) => entry?.versao === v);
      return b?.regular_ids?.includes(id);
    });
    return ix < 0 ? id >= "67" && id <= "74" || id >= "90" && id <= "99" ? 5 : -1 : ix;
  };
  const gate = (versionIndex, label) => {
    if (versionIndex < 1) return;
    // Validação é cumulativa. PASS da última versão não substitui
    // comprovantes obrigatórios das versões mais antigas.
    for (let j = 0; j < versionIndex; j++) {
      const previous = integrationVersions[j];
      const prior = policy?.[previous];
      if (prior?.interna?.status !== "PASS")
        err("P0 INTEGRACAO BLOQUEIA " + label +
            ": falta certificado de integracao interna da " + previous + ".");
      if (j > 0 && prior?.cumulativa?.status !== "PASS")
        err("P0 INTEGRACAO BLOQUEIA " + label +
            ": falta certificado de integracao cumulativa da " + previous + ".");
    }
  };
  const planId = String(plan?.prompt_id || "").padStart(2, "0");
  gate(eligible(planId), "PLAN " + planId);
  for (const path of changed) {
    const match = /(?:^|\/)PROMPT[_-]?(\d{1,2})(?:[_-]|\.)/i.exec(path);
    if (!match || !/(?:^|\/)(?:docs\/frontend\/planos|src|scripts\/testc)\//.test(path))
      continue;
    const id = String(Number(match[1])).padStart(2, "0");
    gate(eligible(id), "PLAN/BUILD " + id);
  }
  if (m?.controle?.rca_impacto?.schema !== "contaos.p0.rca-policy.v1" ||
      !same(m?.controle?.rca_impacto?.aplica_versoes, ["V1", "V2", "V3", "V4", "V5"]) ||
      m?.controle?.rca_impacto?.relatorio_v1 !== "docs/frontend/rca/P0_ESCOPO_V1_ATIVO.json" ||
      m?.controle?.rca_impacto?.relatorio_schema_v1 !== "contaos.p0.v1-scope-proof.v2" ||
      m?.controle?.rca_impacto?.relatorio_ativo !== "docs/frontend/rca/P0_RCA_ATIVO.json" ||
      m?.controle?.rca_impacto?.relatorio_schema !== "contaos.p0.rca-report.v2" ||
      m?.controle?.rca_impacto?.prova_operacional !== "RED_GITHUB_E_GREEN_EXECUTADO_NO_SHA" ||
      m?.controle?.rca_impacto?.gate_certificacao_live !== "scripts/p0-evidence-live-gate.mjs" ||
      m?.restricoes?.rca_impacto_obrigatorio !== true)
    err("P0 RCA: configuracao de causa raiz/impacto ausente ou relaxada.");
  return errors;
}

/** Valida conteúdo, ordem e prova declarada, sem inventar evidência operacional. */
export function validateP0(m, plan, changed = [], fileExists = existsSync) {
  const errors = [];
  const err = (s) => errors.push(s);
  if (m?.schema !== "contaos.p0.version-first.v1" ||
      m.prioridade !== "P0_IMUTAVEL_SEM_DECISAO_EXPRESSA")
    err("Manifesto P0 ausente ou inválido.");
  if (!same(m?.inventario?.regular_00_99, seq(0, 99, 2)) ||
      !same(m?.inventario?.atomic_000_096, seq(0, 96, 3)) ||
      m?.inventario?.regular_total !== 100 ||
      m?.inventario?.atomic_total !== 97)
    err("Inventário original 100 regulares / 97 atômicos foi alterado.");
  if (!same(m?.ordem_versoes, expectCerts) ||
      !Array.isArray(m?.blocos) || m.blocos.length !== 6)
    err("Ordem canônica V1 → V2 → V3 → V4 → V5 → GLOBAL alterada.");
  const expectedRegular = [
    ["43", "75"],
    [...seq(44, 49, 2), "76", "77"],
    [...seq(50, 55, 2), "78", "79"],
    [...seq(56, 59, 2), ...seq(80, 83, 2)],
    [...seq(60, 66, 2), ...seq(84, 89, 2)],
    [...seq(67, 74, 2), ...seq(90, 99, 2)],
  ];
  const expectedAtomic = [
    seq(1, 24, 3), seq(25, 43, 3), seq(44, 54, 3),
    seq(55, 74, 3), seq(75, 84, 3), seq(85, 96, 3),
  ];
  for (const [i, name] of expectCerts.entries()) {
    const b = m?.blocos?.[i];
    if (b?.versao !== name ||
        !same(b?.regular_ids, expectedRegular[i]) ||
        !same(b?.atomic_ids, expectedAtomic[i]))
      err("Sequência regular/atômica divergente no bloco " + name);
  }
  if (!same(m?.baseline?.regular_ids_historicos_00_42, seq(0, 42, 2)) ||
      m?.baseline?.ultimo_regular_integrado !== "42" ||
      m?.baseline?.nao_marcar_100_por_pressuposicao !== true)
    err("O histórico 00–42 não pode ser presumido certificado.");
  const order = expectedRegular.flat();
  if (order.length !== 57 || new Set([...seq(0, 42, 2), ...order]).size !== 100)
    err("P0 deixou um dos 100 prompts regulares de fora ou duplicado.");
  if (new Set(["000", ...expectedAtomic.flat()]).size !== 97 ||
      !same(m?.controle?.nfr_transversais, seq(85, 96, 3)) ||
      m?.controle?.brand_transversal !== "000")
    err("P0 perdeu BRAND-01, requisito atômico ou NFR transversal.");

  const seen = m?.controle?.regulares_pendentes_concluidos_com_evidencia;
  if (!safePrefix(seen, order)) err("Execução futura fora da ordem por versão ou sem recibos sequenciais.");
  const pendingIndex = Array.isArray(seen) ? seen.length : 0;
  const next = order[pendingIndex] || null;
  const pendingVersion = expectedRegular.findIndex((ids, i) =>
    ids.some((x) => order.indexOf(x) >= pendingIndex));
  const statuses = m?.controle?.certificados_por_versao || {};
  for (const [i, name] of expectCerts.entries()) {
    const cert = statuses[name];
    if (!cert || !["PENDENTE", "NO_GO", "PASS"].includes(cert.status)) {
      err("Certificado de versão ausente/inválido: " + name);
      continue;
    }
    if (cert.status !== "PASS") continue;
    if (i > 0 && statuses[expectCerts[i - 1]]?.status !== "PASS")
      err("Certificação " + name + " foi antecipada sem certificado anterior.");
    const expectedIds = i === 0
      ? [...seq(0, 42, 2), ...expectedRegular[0]]
      : expectedRegular[i];
    if (!Array.isArray(cert.regulares_comprovados) ||
        expectedIds.some((id) => !cert.regulares_comprovados.includes(id)))
      err("Certificado " + name + " não comprova todos os regulares exigidos.");
    const atomic = i === 5 ? seq(0, 96, 3) : ["000", ...expectedAtomic[i]];
    if (!Array.isArray(cert.atomic_ids_comprovados) ||
        atomic.some((id) => !cert.atomic_ids_comprovados.includes(id)))
      err("Certificado " + name + " não comprova todos os atômicos exigidos.");
    if (!sha40(cert.pr_merge_sha) || !cert.arquivo_evidencia ||
        !fileExists(cert.arquivo_evidencia) ||
        !/^https:\/\/github\.com\/contaos999999\//.test(cert.ci_url || ""))
      err("Certificado " + name + " não tem documento, commit de merge e CI verificáveis.");
    if (i < 5 && expectedRegular[i].some((id) => !seen?.includes(id)))
      err("Certificado " + name + " emitido antes de concluir seus prompts.");
    if (i === 5 && pendingIndex !== 57)
      err("Certificado GLOBAL antes de executar os 57 regulares restantes.");
  }
  const planId = String(plan?.prompt_id || "").padStart(2, "0");
  if (!/^\d{2}$/.test(planId) || Number(planId) > 99) {
    err("PLANO_ATIVO sem regular válido 00–99.");
  } else if (Number(planId) >= 43) {
    // Após integrar um BUILD, o manifesto do PLAN antigo pode continuar ativo
    // durante o registro documental do recibo. Nunca permite saltar o próximo.
    const oldReceipt = seen?.includes(planId);
    if (planId !== next && !oldReceipt)
      err("P0 PROÍBE SALTO: PLAN " + planId + ", próximo regular permitido " + (next || "NENHUM") + ".");
    const versionIndex = expectedRegular.findIndex((ids) => ids.includes(planId));
    if (versionIndex > 0 && statuses[expectCerts[versionIndex - 1]]?.status !== "PASS")
      err("P0 BLOQUEIA versão " + expectCerts[versionIndex] +
        ": falta certificado da " + expectCerts[versionIndex - 1] + ".");
  }
  // Bloqueia PLAN de versão futura mesmo antes de editar PLANO_ATIVO.
  for (const path of changed) {
    const match = /(?:^|\/)PROMPT[_-]?(\d{1,2})(?:[_-]|\.)/i.exec(path);
    if (!match || !/(?:^|\/)(?:docs\/frontend\/planos|src|scripts\/testc)\//.test(path))
      continue;
    const id = String(Number(match[1])).padStart(2, "0");
    if (!order.includes(id)) continue;
    const idx = expectedRegular.findIndex((ids) => ids.includes(id));
    if (idx > 0 && statuses[expectCerts[idx - 1]]?.status !== "PASS")
      err("P0 BLOQUEIA PLAN/BUILD " + id + ": versão " + expectCerts[idx] +
        " depende de " + expectCerts[idx - 1] + " certificada.");
  }
  if (m?.restricoes?.nenhum_salto_de_versao !== true ||
      m?.restricoes?.todos_100_regulares !== true ||
      m?.restricoes?.todos_97_atomicos !== true ||
      m?.restricoes?.produçao_somente_com_aprovacao_expressa !== true)
    err("Restrições constitucionais P0 foram removidas ou relaxadas.");
  errors.push(...validateIntegrationReceipts(m, plan, changed, fileExists));
  if (!fileExists("docs/frontend/governanca/P0_PRIORIDADE_ZERO_ORDEM_POR_VERSAO_4_1.md"))
    err("Documento normativo P0 ausente.");
  return { errors, next, pendingVersion: expectCerts[pendingVersion] || "ENCERRADO" };
}

function changedFiles() {
  const baseEnv = (process.env.FRONTEND_DIFF_BASE || "").trim();
  const event = process.env.GITHUB_EVENT_NAME || "";
  try {
    const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
    let base = baseEnv && !/^0+$/.test(baseEnv) ? baseEnv : git("rev-parse", "HEAD^");
    let head = "HEAD";
    if (event === "pull_request") {
      try { head = git("rev-parse", "HEAD^2"); } catch { head = "HEAD"; }
      base = git("merge-base", base, head);
    }
    return git("diff", "--name-only", base, head).split("\n").filter(Boolean);
  } catch {
    // Executar o teste de catálogo mesmo em teste unitário ou repositório sem pai.
    return [];
  }
}
function main() {
  const manifest = JSON.parse(readFileSync(P0, "utf8"));
  const plan = JSON.parse(readFileSync(PLAN, "utf8"));
  const result = validateP0(manifest, plan, changedFiles());
  if (result.errors.length) {
    for (const e of result.errors) console.error("PRIORIDADE ZERO FAIL: " + e);
    process.exitCode = 1;
    return;
  }
  console.log("PRIORIDADE ZERO PASS — ordem por versão intacta, 100 regulares/97 atômicos preservados.");
  console.log("Versão pendente: " + result.pendingVersion +
    "; próximo regular elegível: " + result.next +
    "; PLAN atualmente registrado: " + plan.prompt_id + ".");
}
if (process.argv[1] && fileURLToPath(import.meta.url) ===
    fileURLToPath(new URL("file://" + process.argv[1]))) main();

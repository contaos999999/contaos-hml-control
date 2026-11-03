import { execFileSync } from "node:child_process";

/**
 * ADR-DEV-002. CI posterior ao push; não substitui branch protection.
 * Proíbe mudanças de backend e exige PLAN validado em commit anterior ao BUILD.
 */
const TYPES = "src/integrations/supabase/types.ts";
const CERTIFIED_TYPES = "8ea7750b75fd9d76b29c36ce7613392e3ab65e19";
const PLAN = "docs/frontend/planos/PLANO_ATIVO.json";
const SOURCE_CONTEXT = "docs/frontend/CONTEXT_CANONICO_4_1_SNAPSHOT.json";
const REQUIRED_CONTEXT_FILES = [
  "00_AI_LEIA_ANTES_DE_ALTERAR.md",
  "01_PRD_MESTRE_4_1.md",
  "02_PREMISSAS_FUNCIONAIS_TECNICAS_4_1.md",
  "03_ARQUITETURA_OFICIAL_4_1.md",
  "04_MANUAL_AMBIENTE_E_PROMOCAO_4_1.md",
  "05_BACKEND_SUPABASE_CERTIFICADO_4_1.md",
  "06_FRONTEND_LOVABLE_ESPECIFICACAO_4_1.md",
  "07_ZERO_DRIFT_GOVERNANCA_4_1.md",
  "08_REQUISITOS_96_E_CRITERIOS_ACEITE_4_1.md",
  "08A_REQUISITOS_001_024_4_1.md",
  "08B_REQUISITOS_025_048_4_1.md",
  "08C_REQUISITOS_049_072_4_1.md",
  "08D_REQUISITOS_073_096_4_1.md",
  "09_RASTREABILIDADE_FONTES_AUDITORIA_4_1.md",
  "10_IA_OCR_RAG_E_PRECEDENTES_4_1.md",
  "11_RNF_PERFORMANCE_CONCORRENCIA_RESILIENCIA_4_1.md",
  "12_PROMPTS_PROTOCOLO_IMPLEMENTACAO_4_1.md",
  "13_MAPA_DOCUMENTOS_PACOTE_4_1.md",
  "14_CHECKLIST_PRE_ALTERACAO.md",
  "15_ESTADO_CERTIFICADO_HML_4_1.md",
  "16_CUSTOS_E_PLANOS_REFERENCIA_4_1.md",
  "17_FONTES_TECNICAS_E_QA_4_1.md",
  "18_SCHEMA_RLS_EDGE_QUEUES_CRON_4_1.md",
  "19_IDENTIDADE_VISUAL_OFICIAL_BRAND_1_0.md",
  "20_PROMPT_000_BRAND_01.md",
];
const REQUIRED_PLAN_GATES = [
  "prd",
  "premissas",
  "arquitetura",
  "atomicos",
  "brand",
  "seguranca",
  "nfr",
  "zero_drift",
  "tdd",
  "ci",
  "teste_c_planejado",
  "rollback",
];

const BASE = (process.env.FRONTEND_DIFF_BASE || "").trim();
const EVENT = (process.env.GITHUB_EVENT_NAME || "").trim();
const errors = [];

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
function availableCommit(sha) {
  try {
    git("cat-file", "-e", sha + "^{commit}");
    return true;
  } catch {
    return false;
  }
}

let base = BASE;
if (EVENT === "workflow_dispatch" && !base) {
  console.log("SCOPE GATE: execução manual sem diff; checagem de escopo por commit não se aplica.");
  process.exit(0);
}
if (!base || /^0+$/.test(base)) {
  try {
    base = git("rev-parse", "HEAD^");
  } catch {
    console.error("SCOPE GATE FAIL: sem commit base comparável.");
    process.exit(1);
  }
}
if (!availableCommit(base)) {
  console.error("SCOPE GATE FAIL: commit base não foi obtido: " + base);
  process.exit(1);
}
let diffHead = "HEAD";
if (EVENT === "pull_request") {
  // actions/checkout default for PR uses GitHub's synthetic merge commit.
  // Its second parent is the actual feature branch. Respect the PLAN commit
  // published on that branch before the first BUILD.
  try {
    diffHead = git("rev-parse", "HEAD^2");
  } catch {
    diffHead = "HEAD";
  }
  base = git("merge-base", base, diffHead);
}
const changed = git("diff", "--name-only", "--diff-filter=ACMRD", base, diffHead)
  .split("\n")
  .filter(Boolean);

const forbidden = [
  /^supabase\//i,
  /^backend\//i,
  /^database\//i,
  /^migrations\//i,
  /^edge-functions\//i,
  /^functions\//i,
  /^src\/integrations\/supabase\//i,
  /^(?:\.env(?:\.|$)|\.secrets(?:\.|$))/i,
];

let restoredTypes = false;
for (const path of changed) {
  if (!forbidden.some((rule) => rule.test(path))) continue;
  if (path === TYPES) {
    const actual = git("hash-object", TYPES);
    if (actual === CERTIFIED_TYPES) {
      restoredTypes = true; // recuperação permitida SOMENTE para o blob certificado
      continue;
    }
  }
  errors.push("ALTERAÇÃO DE BACKEND OU INTEGRAÇÃO PROIBIDA: " + path);
}

const sourcePaths = changed.filter(
  (path) =>
    (path.startsWith("src/") && path !== TYPES) ||
    path.startsWith("public/") ||
    [
      "package.json",
      "bun.lock",
      "index.html",
      "vite.config.ts",
      "tsconfig.json",
      "tsconfig.app.json",
      "tailwind.config.ts",
    ].includes(path),
);
let planRef = base;
if (EVENT === "pull_request" && sourcePaths.length) {
  const commits = git("rev-list", "--first-parent", "--reverse", base + ".." + diffHead)
    .split("\n")
    .filter(Boolean);
  for (const commit of commits) {
    const parent = git("rev-parse", commit + "^");
    const files = git("diff", "--name-only", parent, commit).split("\n");
    if (files.some((path) => sourcePaths.includes(path))) {
      planRef = parent;
      break;
    }
  }
}
if (sourcePaths.length) {
  let plan;
  try {
    plan = JSON.parse(git("show", planRef + ":" + PLAN));
  } catch {
    errors.push("BUILD SEM PLAN ANTERIOR: falta " + PLAN + " no commit de base.");
  }
  if (plan) {
    if (
      plan.schema !== "contaos.frontend.plan.v1" ||
      plan.status !== "VALIDADO" ||
      plan.validacao?.resultado !== "PASS"
    ) {
      errors.push("BUILD BLOQUEADO: PLAN anterior não foi VALIDADO com todos os gates PASS.");
    }
    if (
      !plan.prompt_id ||
      !plan.plano_documento ||
      !Array.isArray(plan.arquivos_permitidos) ||
      !plan.arquivos_permitidos.length
    ) {
      errors.push("PLAN anterior sem prompt, documento de evidência ou allowlist fechada.");
    }
    if (
      plan.validacao?.aprovacao_humana_exigida === true &&
      plan.validacao?.aprovacao_humana !== "CONCEDIDA"
    ) {
      errors.push("PLAN depende de aprovação humana explícita, ainda não concedida.");
    }
    // Context Gate 4.1: fixar as mesmas 25 fontes canônicas e a
    // correlação 100 regulares / 97 atômicos ANTES do BUILD.
    let context;
    let promptContent = "";
    try {
      context = JSON.parse(git("show", planRef + ":" + SOURCE_CONTEXT));
    } catch {
      errors.push("CONTEXT GATE: snapshot das fontes canônicas ausente no PLAN anterior.");
    }
    try {
      promptContent = git("show", planRef + ":" + plan.plano_documento);
    } catch {
      errors.push("CONTEXT GATE: documento do PLAN ausente no commit anterior.");
    }
    if (
      !promptContent.includes("ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE (OBRIGATÓRIO)")
    ) {
      errors.push("PLAN sem cláusula ZERO-DRIFT literal exigida pelo pacote 4.1.");
    }
    if (context) {
      if (
        context.schema !== "contaos.frontend.canonical-source-snapshot.v1" ||
        context.source_repo !== "contaos9999/develop" ||
        !/^[a-f0-9]{40}$/.test(context.source_commit || "")
      ) {
        errors.push("Contexto canônico não tem origem/commit verificável.");
      }
      const documents = context.context_documents || [];
      const names = documents.map((item) => item.path);
      if (
        documents.length !== 25 ||
        new Set(names).size !== 25 ||
        REQUIRED_CONTEXT_FILES.some((path) => !names.includes(path)) ||
        documents.some((item) => !/^[a-f0-9]{40}$/.test(item.blob_sha || ""))
      ) {
        errors.push("Context Gate exige os mesmos 25 documentos e blobs canônicos.");
      }
      const catalog = context.prompt_catalog || {};
      const regular = Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0"));
      const atomic = Array.from({ length: 97 }, (_, i) => String(i).padStart(3, "0"));
      if (
        JSON.stringify(catalog.regular_ids) !== JSON.stringify(regular) ||
        JSON.stringify(catalog.atomic_ids) !== JSON.stringify(atomic) ||
        catalog.crosswalk?.length !== 100 ||
        !/^[a-f0-9]{64}$/.test(catalog.originals_regular_sha256 || "") ||
        !/^[a-f0-9]{64}$/.test(catalog.originals_atomic_sha256 || "") ||
        !/^[a-f0-9]{40}$/.test(catalog.source_blob_sha || "")
      ) {
        errors.push("Inventário 100/97 ou fingerprint dos prompts originais inválido.");
      }
      if (
        plan.context_pack_version !== "4.1" ||
        plan.context_read_acknowledged !== true ||
        !plan.context_read_by ||
        !plan.context_read_acknowledged_at ||
        plan.context_source_commit !== context.source_commit ||
        plan.context_catalog_blob !== catalog.source_blob_sha ||
        !Array.isArray(plan.context_documents_read) ||
        REQUIRED_CONTEXT_FILES.some((name) => !plan.context_documents_read.includes(name))
      ) {
        errors.push("Context Gate: leitura integral 4.1/fingerprint não declarados no PLAN.");
      }
      const crosswalk = plan.prompt_crosswalk || {};
      const sourceRow = catalog.crosswalk?.find((row) => row.regular_id === plan.prompt_id);
      const direct = crosswalk.direct_atomic_ids || [];
      const extra = crosswalk.additional_transversal_atomic_ids || [];
      const used = [...direct, ...extra];
      if (
        !/^(?:0[0-9]|[1-9][0-9])$/.test(plan.prompt_id || "") ||
        crosswalk.regular_prompt_id !== plan.prompt_id ||
        crosswalk.regular_original_sha256 !== catalog.originals_regular_sha256 ||
        crosswalk.atomic_original_sha256 !== catalog.originals_atomic_sha256 ||
        crosswalk.source_evidence_missing !== false ||
        !sourceRow?.source_verified ||
        sourceRow.status !== "mapeamento_estrutural_por_tela_extraido_das_fontes" ||
        !Array.isArray(direct) ||
        !direct.includes("000") ||
        new Set(used).size !== used.length ||
        used.some((id) => !catalog.atomic_ids?.includes(id)) ||
        (sourceRow?.relevant_atomic_ids || []).some(
          (id) => !used.includes(id) && !crosswalk.exclusoes_justificadas?.[id],
        )
      ) {
        errors.push("Crosswalk: PROMPT regular, atômicos ou fonte original sem prova.");
      }
    }
    if (
      plan.prompt_policy?.required_section !==
        "ZERO-DRIFT — IDENTIDADE VISUAL + ECONOMIA LOVABLE" ||
      plan.brand_context !== "ContaOS Brand v1.0" ||
      plan.prompt_000_brand_01_read !== true
    ) {
      errors.push("Gates transversais BRAND-01 e economia Lovable ausentes do PLAN.");
    }
    if (
      !plan.validacao?.ci_plano_url?.startsWith(
        "https://github.com/contaos9999/contaos-hml-control/actions/runs/",
      ) ||
      REQUIRED_PLAN_GATES.some((key) => plan.validacao?.gates?.[key] !== "PASS")
    ) {
      errors.push("Validação formal incompleta: CI do PLAN/gates obrigatórios ausentes.");
    }
    if (
      sourcePaths.some(
        (p) =>
          p.startsWith("public/brand/") ||
          p.startsWith("src/components/brand/") ||
          p === "src/styles.css",
      ) &&
      plan.validacao?.aprovacao_humana_exigida !== true
    ) {
      errors.push("Mudança de identidade visual sem gate humano de aprovação.");
    }
    if (
      plan.validacao?.aprovacao_humana_exigida === true &&
      !plan.validacao?.aprovacao_humana_evidencia
    ) {
      errors.push("Aprovação humana sem evidência rastreável no PLAN.");
    }
    if (plan.impacto_visual !== "SIM" && plan.impacto_visual !== "N/A") {
      errors.push("Impacto visual não classificado no PLAN.");
    }
    if (plan.impacto_visual === "N/A" && !plan.impacto_visual_justificativa) {
      errors.push("Impacto visual N/A exige justificativa específica.");
    }
    for (const path of sourcePaths) {
      if (!plan.arquivos_permitidos?.includes(path))
        errors.push("ARQUIVO FORA DO PLAN VALIDADO: " + path);
    }
    for (const path of plan.arquivos_permitidos || []) {
      if (forbidden.some((rule) => rule.test(path)))
        errors.push("PLAN contém caminho proibido de backend: " + path);
    }
  }
}
if (errors.length) {
  errors.forEach((item) => console.error("FRONTEND SCOPE FAIL: " + item));
  process.exit(1);
}
console.log(
  "FRONTEND SCOPE PASS: " +
    changed.length +
    " arquivos modificados; " +
    sourcePaths.length +
    " do aplicativo sob PLAN prevalidado; " +
    (restoredTypes ? "recuperação do blob types.ts certificado" : "nenhuma mudança backend"),
);
console.log(
  "LIMITAÇÃO: escopo é verificado no CI pós-push; gates semânticos exigem evidência e Teste C.",
);

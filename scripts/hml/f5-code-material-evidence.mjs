/** F5 CODE material validator; partial receipts are never certificates. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
export const BACKEND = "a1516de1d8949e505d83b5e000eb1cc558b217a7";
export const BATCHES = Object.freeze({
  closure: ["0477", "0482", "0484", "0496", "0502", "0504", "0562", "0563", "0564", "0567"],
  competenceactions: [
    "0352",
    "0365",
    "0368",
    "0369",
    "0370",
    "0371",
    "0372",
    "0373",
    "0376",
    "0433",
    "0437",
    "0439",
    "0441",
    "0443",
    "0455",
    "0458",
    "0461",
    "0463",
    "0465",
  ],
  contractdocuments: ["0288", "0294", "0297", "0311", "0315", "0320", "0321", "0324"],
  competencedocuments: ["0410", "0413", "0415", "0416", "0418", "0420"],
  adm01: [
    "0002",
    "0007",
    "0009",
    "0011",
    "0012",
    "0014",
    ...Array.from({ length: 19 }, (_, i) => String(i + 16).padStart(4, "0")),
  ],
  context: ["0005", "0036", "0037", "0043"],
  competence: ["0058", "0059", "0060", "0061", "0063"],
  data: ["0050", "0051", "0052", "0053", "0054", "0055", "0056", "0062", "0064", "0065"],
  actions: ["0041", "0045", "0046", "0047", "0048", "0049", "0057", "0066", "0067", "0068"],
  parties: ["0093", "0096", "0098", "0100", "0107", "0111", "0113", "0115", "0116"],
  contracts: [
    "0132",
    "0136",
    "0139",
    "0140",
    "0146",
    "0153",
    "0156",
    "0159",
    "0162",
    "0165",
    "0167",
    "0170",
    "0172",
    "0174",
    "0176",
  ],
  normatives: [
    "0192",
    "0200",
    "0202",
    "0203",
    "0204",
    "0205",
    "0208",
    "0232",
    "0233",
    "0234",
    "0237",
    "0260",
    "0262",
    "0263",
    "0264",
    "0265",
    "0268",
  ],
});
export const A = "a1111111-1111-4111-8111-111111111111",
  B = "a2222222-2222-4222-8222-222222222222";
const U = "a3333333-3333-4333-8333-333333333333",
  V = "b3333333-3333-4333-8333-333333333333";
const sha = (v) => typeof v === "string" && /^[a-f0-9]{40}$/.test(v);
const num = (v) => typeof v === "string" && /^[1-9][0-9]*$/.test(v);
const uuid = (v) =>
  typeof v === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(v);
const record = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const fail = (reason) => {
  throw Error(reason);
};
const rules = {
  "0005": {
    positive: {
      actor: U,
      tenant: A,
      target: A,
      frontier: "dashboard",
      operation: "read",
      decision: "ALLOW",
    },
    negative: {
      actor: V,
      tenant: B,
      target: A,
      frontier: "dashboard",
      operation: "read",
      decision: "DENY",
    },
  },
  "0036": {
    positive: {
      actor: V,
      tenant: B,
      target: B,
      frontier: "selector",
      operation: "list",
      decision: "ALLOW",
    },
    negative: {
      actor: V,
      tenant: B,
      target: A,
      frontier: "selector",
      operation: "list",
      decision: "ISOLATED",
    },
  },
  "0037": {
    positive: {
      actor: U,
      tenant: A,
      target: A,
      frontier: "dashboard",
      operation: "read",
      decision: "ALLOW",
    },
    negative: {
      actor: V,
      tenant: B,
      target: A,
      frontier: "dashboard",
      operation: "read",
      decision: "ISOLATED",
    },
  },
  "0043": {
    positive: {
      actor: U,
      tenant: B,
      target: B,
      frontier: "dashboard",
      operation: "switch",
      decision: "ALLOW",
    },
    negative: {
      actor: U,
      tenant: B,
      target: A,
      frontier: "dashboard",
      operation: "switch",
      decision: "ISOLATED",
    },
  },
};
const readFrontiers = {
  competence: {
    "0058": "obter_visao_geral_competencia",
    "0059": "obter_documentos_competencia_v115",
    "0060": "obter_analise_competencia_v116",
    "0061": "obter_detalhe_requisito_v117",
    "0063": "obter_visao_geral_competencia",
  },
  data: {
    "0050": "contratos",
    "0051": "fontes_normativas",
    "0052": "propostas_orcamentarias",
    "0053": "listas_verificacao",
    "0054": "documentos_contrato",
    "0055": "documentos_contrato",
    "0056": "competencias",
    "0062": "pareceres_internos",
    "0064": "apresentacoes_contratante",
    "0065": "relatorios_historicos_contratante",
  },
};
const actionContracts = {
  "0041": ["consultar_permissoes_efetivas", "read", "administrador"],
  "0045": ["contratantes", "read", "leitor"],
  "0046": ["contratantes", "create", "gestor_contrato"],
  "0047": ["atualizar_contratante", "update", "gestor_contrato"],
  "0048": ["contratos", "read", "leitor"],
  "0049": ["contratos", "create", "gestor_contrato"],
  "0057": ["criar_competencia", "create", "gestor_contrato"],
  "0066": ["relatorios_historicos_contratante", "read", "leitor"],
  "0067": ["criar_organizacao", "create", "leitor"],
  "0068": ["eventos_auditoria", "read", "administrador"],
};
const inventory = JSON.parse(
  fs.readFileSync(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_1_CASE_CONTRACTS_PROPOSAL.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const admContracts = new Map(
  inventory.cases
    .filter((c) => c.batch === "adm01")
    .map((c) => [c.caseId.slice(-4), c.seedMatrixCandidate]),
);
const f52Inventory = JSON.parse(
  fs.readFileSync(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_2_CASE_CONTRACTS_PROPOSAL.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const f52Cases = new Map(f52Inventory.cases.map((entry) => [entry.caseId.slice(-4), entry]));
const f53Inventory = JSON.parse(
  fs.readFileSync(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_3_CASE_CONTRACTS_PROPOSAL.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const f53Cases = new Map(f53Inventory.cases.map((entry) => [entry.caseId.slice(-4), entry]));
const f54Inventory = JSON.parse(
  fs.readFileSync(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_4_CASE_CONTRACTS_PROPOSAL.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const f54Cases = new Map(f54Inventory.cases.map((entry) => [entry.caseId.slice(-4), entry]));
const f55Inventory = JSON.parse(
  fs.readFileSync(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_5_CASE_CONTRACTS_PROPOSAL.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const f55Cases = new Map(f55Inventory.cases.map((entry) => [entry.caseId.slice(-4), entry]));
const f56Inventory = JSON.parse(
  fs.readFileSync(
    new URL(
      "../../docs/frontend/auditorias/integracao-funcional-v1/fase5/F5_6_CASE_CONTRACTS_PROPOSAL.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const f56Cases = new Map(f56Inventory.cases.map((entry) => [entry.caseId.slice(-4), entry]));
const normativeStates = {
  V107: {
    ref: 13,
    version: 12,
    initial: "nao_aplicavel",
    changed: "aplicavel",
    hashSeed: "Fonte F5.3 a",
  },
  V108: {
    ref: 22,
    version: 22,
    initial: "rascunho",
    changed: "publicada",
    hashSeed: "Orçamento F5.3 a",
  },
  V109: {
    ref: 31,
    version: 32,
    initial: "rascunho",
    changed: "publicada",
    hashSeed: "Fonte F5.3 a",
  },
};
const normativeConsumers = {
  V109: 33,
  V113: 42,
  V114: 41,
  V115: 42,
  V116: 42,
  V117: 42,
  V118: 45,
  V119: 41,
  V123: 50,
};
const downstreamReads = {
  V107: "fontes_normativas",
  V108: "propostas_orcamentarias",
  V109: "listas_verificacao",
  V110: "documentos_contrato",
  V111: "documentos_contrato",
  V112: "competencias",
  V113: "consultar_permissoes_efetivas",
  V121: "apresentacoes_contratante",
  V122: "relatorios_historicos_contratante",
};
const fixtureId = (tenant, series, id) =>
  tenant + series + "0000-0000-4000-8000-" + String(id).padStart(12, "0");
const contextTitles = {
  "0005": [
    "authorized reader sees own dashboard",
    "forged organization receives denial without dashboard",
  ],
  "0036": ["B identity sees and selects B only", "old identity preference cannot select A"],
  "0037": [
    "login list and dashboard use authenticated A",
    "second identity does not inherit first cache",
  ],
  "0043": [
    "real selector switch invalidates A cache",
    "delayed A data cannot render after B switch",
  ],
};
const batchesWithEvidence = {
  closure: {
    file: "f5-code-closure-scope-isolation.test.ts",
    suite: "F5 closure scope isolation",
    title: (_id, index) =>
      [
        "scoped material reaches the authorized consumer",
        "foreign material remains hidden and unchanged",
      ][index],
    check: checkClosure,
  },
  competenceactions: {
    file: "f5-code-competence-actions-scope-isolation.test.tsx",
    suite: "F5 competence actions scope isolation",
    title: (_id, index) =>
      [
        "authorized competence action reaches its consumer",
        "foreign competence action has no effect or disclosure",
      ][index],
    check: checkCompetenceActions,
  },
  contractdocuments: {
    file: "f5-code-v110-v111-document-scope-isolation.test.ts",
    suite: "F5 V110/V111 document scope isolation",
    title: (_id, index) =>
      [
        "document change and lineage remain scoped",
        "foreign document action has no effect or link",
      ][index],
    check: checkDocuments,
  },
  competencedocuments: {
    file: "f5-code-v115-document-scope-isolation.test.ts",
    suite: "F5 V115 competence document scope isolation",
    title: (_id, index) =>
      [
        "competence document reaches the authorized consumer",
        "foreign competence document and effects remain hidden",
      ][index],
    check: checkDocuments,
  },
  context: {
    file: "f5-code-context-session-isolation.test.tsx",
    suite: "F5 context material isolation",
    title: (id, index) => contextTitles[id][index],
    check: checkContext,
  },
  competence: {
    file: "f5-code-sys04-competence-isolation.test.ts",
    suite: "F5 SYS04 competence isolation",
    title: (_id, index) =>
      ["material read in the selected tenant", "stale case is denied after switching identity"][
        index
      ],
    check: (o, id) => checkRead("competence", o, id),
  },
  data: {
    file: "f5-code-sys04-data-isolation.test.ts",
    suite: "F5 SYS04 data isolation",
    title: (_id, index) =>
      [
        "scoped query returns only the selected tenant material",
        "previous tenant data is denied without follow-on reads",
      ][index],
    check: (o, id) => checkRead("data", o, id),
  },
  actions: {
    file: "f5-code-sys04-actions-isolation.test.ts",
    suite: "F5 SYS04 action isolation",
    title: (_id, index) =>
      ["authorized operation and scoped readback", "unauthorized operation has no material effect"][
        index
      ],
    check: checkAction,
  },
  adm01: {
    file: "f5-code-adm01-rbac-isolation.test.tsx",
    suite: "F5 ADM01 authorization and isolation",
    title: (_id, index) =>
      [
        "persisted binding is reflected in its authorized consumer",
        "another tenant cannot grant access or consume the protected result",
      ][index],
    check: checkAdm,
  },
  parties: {
    file: "f5-code-v102-v103-scope-isolation.test.ts",
    suite: "F5 V102/V103 party scope isolation",
    title: (_id, index) =>
      [
        "authorized party mutation reaches the scoped consumer",
        "foreign party mutation is denied and remains hidden",
      ][index],
    check: checkParty,
  },
  contracts: {
    file: "f5-code-v105-v106-scope-isolation.test.tsx",
    suite: "F5 V105/V106 contract scope isolation",
    title: (_id, index) =>
      [
        "authorized contract change reaches the scoped consumer",
        "foreign contract change is denied and remains hidden",
      ][index],
    check: checkContract,
  },
  normatives: {
    file: "f5-code-v107-v108-v109-scope-isolation.test.ts",
    suite: "F5 V107/V108/V109 normative scope isolation",
    title: (_id, index) =>
      [
        "authorized material change reaches the scoped consumer",
        "foreign material change is denied and remains hidden",
      ][index],
    check: checkNormative,
  },
};
function checkScopedChange(o, canonical, producer, operation, label, association = false) {
  const positive = o.kind === "positive";
  const b = o.readback;
  if (
    !canonical ||
    o.origin !== canonical.origin ||
    o.destination !== canonical.destination ||
    o.frontier !== canonical.consumer ||
    o.operation !== operation ||
    o.actor !== (positive ? U : V) ||
    o.role !== (positive ? "administrador" : association ? "gestor_contrato" : "leitor") ||
    o.tenant !== (positive ? A : B) ||
    o.target !== A ||
    o.decision !== (positive ? "ALLOW" : "DENY") ||
    b.producer !== producer ||
    b.foreignVisible !== false
  )
    fail(label + " actor/tenant/producer/consumer mismatch");
  if (
    !positive &&
    (b.ownOrganizationId !== B ||
      b.resultId !== undefined ||
      b.status !== (association ? 409 : 403) ||
      b.code !== (association ? "23503" : "42501") ||
      b.mutationCount !== 0)
  )
    fail(label + " authorization denial missing or produced an effect");
  return canonical;
}
const competenceActions = {
  V113: ["create", "CompetenciaCriada", "competencias", 2],
  V116: ["request", "AnaliseSolicitada", "execucoes_analise", 5],
  V117: ["review", "RevisaoRequisitoRegistrada", "resultados_requisitos", 7],
};

function checkCompetenceActions(o, id) {
  const canonical = f55Cases.get(id);
  const [operation, event, entity, entityOffset] = competenceActions[canonical?.origin] ?? [];
  checkScopedChange(o, canonical, canonical?.producer, operation, "F5.5");
  const b = o.readback;
  const a = (n) => fixtureId("a", "550", n);
  if (o.kind === "negative") {
    if (b.ownCompetenceId !== fixtureId("b", "550", 2) || b.preservedCompetenceId !== a(2))
      fail("F5.5 negative readback did not preserve each competence");
    return;
  }
  if (
    b.organizationId !== A ||
    b.contractId !== a(1) ||
    b.competenceId !== a(2) ||
    b.mutationCount !== 1 ||
    !record(b.observed)
  )
    fail("F5.5 competence or effect mismatch");

  const observed = b.observed;
  if (
    operation !== "create" &&
    (b.previousExecution !== a(4) ||
      b.currentExecution !== a(5) ||
      !/^[a-f0-9]{64}$/.test(b.previousHash) ||
      !/^[a-f0-9]{64}$/.test(b.currentHash))
  )
    fail("F5.5 execution provenance missing");
  if (
    operation === "request" &&
    (b.previousHash === b.currentHash || b.executionState !== "queued")
  )
    fail("F5.5 analysis reused obsolete input or failed to queue");
  if (
    operation === "review" &&
    (b.previousHash !== b.currentHash ||
      b.executionState !== "complete" ||
      b.requestId !== a(13) ||
      b.revision?.resultId !== a(7) ||
      b.revision?.requirementId !== a(3) ||
      b.revision?.versionId !== a(9) ||
      b.revision?.page !== 2 ||
      !b.revision?.excerpt ||
      !b.revision?.justification)
  )
    fail("F5.5 review provenance or evidence lost");

  switch (canonical.destination) {
    case "SYS05":
      if (
        b.before?.count !== 1 ||
        observed.count !== 2 ||
        b.before.deadlineId !== a(14) ||
        observed.deadlineId !== a(14) ||
        !observed.groups?.some((g) => g.situacao === "rascunho" && g.quantidade === 1)
      )
        fail("F5.5 dashboard count, grouping or deadlines mismatch");
      break;
    case "V112":
      if (observed.id !== a(2) || observed.reference !== "2026-11-01")
        fail("F5.5 competence listing mismatch");
      break;
    case "V115":
      if (observed.requirementId !== a(3) || observed.documents !== 0)
        fail("F5.5 initial documentary scope mismatch");
      break;
    case "V116":
      if (
        operation === "review"
          ? observed.status !== "complete" || observed.resultId !== a(7)
          : observed.status !== "not_analyzed" || observed.resultId !== null
      )
        fail("F5.5 current analysis result mismatch");
      break;
    case "V117":
      if (
        observed.previousResult !== a(6) ||
        observed.currentResult !== null ||
        observed.version !== a(9)
      )
        fail("F5.5 queued analysis reused a previous result as current");
      break;
    case "V118":
      if (
        observed.currentApproval !== false ||
        observed.status !==
          (operation === "create" ? null : operation === "request" ? "aprovado" : "substituido")
      )
        fail("F5.5 opinion current approval or history mismatch");
      break;
    case "V120":
      if (observed.count !== 0 || observed.canPresent !== false)
        fail("F5.5 new competence exposes a protocol");
      break;
    case "V123":
      if (
        observed.id !== a(11) ||
        observed.evento !== event ||
        observed.entidade !== entity ||
        observed.id_entidade !== a(entityOffset) ||
        observed.id_usuario !== U ||
        observed.correlation_id !== a(12) ||
        observed.origem !== "usuario"
      )
        fail("F5.5 audit event, subject or correlation mismatch");
      break;
    default:
      if (
        observed.id !== a(2) ||
        observed.canPresent !== false ||
        observed.currentApproval !== false ||
        observed.analysisCurrent !== (operation === "review") ||
        observed.situation !==
          (operation === "create"
            ? "rascunho"
            : operation === "request"
              ? "em_analise"
              : "pendente_correcao")
      )
        fail("F5.5 overview, analysis or presentation gate mismatch");
  }
}
const closureActions = {
  V118: ["approve", "ParecerInternoRevisado", "pareceres_internos", 23],
  V119: ["register", "ApresentacaoRegistrada", "apresentacoes_contratante", 25],
  V122: ["import", "HistoricoImportacaoRegistrada", "relatorios_historicos_contratante", 30],
};
function checkClosure(o, id) {
  const canonical = f56Cases.get(id);
  const [operation, event, entity, offset] = closureActions[canonical?.origin] ?? [];
  checkScopedChange(o, canonical, canonical?.producer, operation, "F5.6");
  const b = o.readback;
  const a = (n) => fixtureId("a", "550", n);
  if (o.kind === "negative") {
    if (b.ownCompetenceId !== fixtureId("b", "550", 22) || b.preservedCompetenceId !== a(22))
      fail("F5.6 negative competence readback mismatch");
    return;
  }
  const { material: m, observed: x } = b;
  if (
    b.organizationId !== A ||
    b.contractId !== a(21) ||
    b.competenceId !== a(22) ||
    b.mutationCount !== 1 ||
    !record(m) ||
    !record(x)
  )
    fail("F5.6 scope or mutation mismatch");
  if (
    operation === "approve" &&
    (m.opinion?.id !== a(23) ||
      m.opinion?.id_competencia !== a(22) ||
      m.opinion?.autor !== a(24) ||
      m.opinion?.aprovado_por !== U ||
      m.opinion?.status !== "aprovado" ||
      m.canPresent !== false ||
      m.compliant !== 50)
  )
    fail("F5.6 authorship or blocking gate mismatch");

  if (operation === "register") {
    const p = m.snapshot?.pacote;
    const r = m.snapshot?.apresentacao;
    const [item] = m.snapshot?.itens ?? [];
    const sha256 = (v) => createHash("sha256").update(v).digest("hex");
    const digest = sha256(
      sha256("parecer F5.6 " + A) + "|" + sha256("versão documental F5.6 " + A),
    );
    if (
      r?.id !== a(25) ||
      r.id_pacote !== a(26) ||
      r.protocolo !== "PROTOCOLO-F56" ||
      p?.id !== a(26) ||
      p.id_competencia !== a(22) ||
      p.status !== "apresentado" ||
      !p.congelado_em ||
      p.hash_pacote !== digest ||
      item?.versao_id !== a(28) ||
      item.id_pacote !== a(26) ||
      item.hash !== sha256("versão documental F5.6 " + A) ||
      m.requestId !== a(29) ||
      m.currentVersion !== a(41)
    )
      fail("F5.6 immutable package or protocol mismatch");
  }
  if (
    operation === "import" &&
    (m.report?.id !== a(30) ||
      m.report?.id_arquivo !== a(31) ||
      m.report?.competencia_referencia !== "2026-10-01" ||
      m.report?.id_contrato !== a(21) ||
      m.report?.origem_temporal !== "pre_implantacao" ||
      m.report?.status_processamento !== "pendente" ||
      m.generatedRules !== 0 ||
      m.beforeResult !== a(35) ||
      m.afterResult !== a(35) ||
      !/^[a-f0-9]{64}$/.test(m.beforeHash) ||
      m.beforeHash !== m.afterHash)
  )
    fail("F5.6 historical origin or current evidence changed");

  switch (canonical.destination) {
    case "V123":
      if (
        x.id !== a(32) ||
        x.id_entidade !== a(offset) ||
        x.evento !== event ||
        x.entidade !== entity ||
        x.correlation_id !== a(33) ||
        x.id_usuario !== U ||
        x.origem !== "usuario"
      )
        fail("F5.6 audit event or correlation mismatch");
      break;
    case "V120":
      if (JSON.stringify(x) !== JSON.stringify(m.snapshot))
        fail("F5.6 presentation consumer returned a different snapshot");
      break;
    case "V121":
      if (JSON.stringify(x) !== JSON.stringify(m.report))
        fail("F5.6 historical consumer returned a different report");
      break;
    case "V116":
      if (x.resultId !== a(35) || x.execution !== a(34) || x.hash !== m.afterHash)
        fail("F5.6 analysis changed during historical import");
      break;
    case "V117":
      if (x.resultId !== a(35) || x.requirementId !== a(36) || x.versionId !== a(28))
        fail("F5.6 requirement evidence changed during historical import");
      break;
    default:
      if (
        x.id !== a(22) ||
        x.canPresent !== false ||
        x.approvedOpinion !== true ||
        (operation === "approve"
          ? x.blocked !== 1
          : x.status !== "aguardando_contratante" || x.packageVersion !== 1)
      )
        fail("F5.6 overview or presentation gate mismatch");
  }
}
function checkScopeF52(o, id, producer, operation, association = false) {
  return checkScopedChange(o, f52Cases.get(id), producer, operation, "F5.2", association);
}
function checkAuditF52(b, materialId, event, series) {
  if (
    b.eventEntityId !== materialId ||
    b.event !== event ||
    b.resultId !== fixtureId("a", series, 3) ||
    b.correlationId !== fixtureId("a", series, 4)
  )
    fail("F5.2 audit event or correlation mismatch");
}
function checkParty(o, id) {
  const create = ["0093", "0096", "0098", "0100"].includes(id);
  const { destination } = checkScopeF52(
    o,
    id,
    create ? "contratantes" : "rpc/atualizar_contratante",
    create ? "create" : "update",
  );
  const b = o.readback;
  const partyId = fixtureId("a", "520", 1);
  if (o.kind === "negative") {
    if (b.visible !== 0 || b.ownMaterialId !== fixtureId("b", "520", 1) || b.ownVersion !== 1)
      fail("F5.2 party exposed or own record changed");
    if (id === "0107" && (b.classifiedConflict !== "conflito" || b.classifiedTransport !== "erro"))
      fail("F5.2 party authorization, conflict and transport were not distinguished");
    return;
  }
  if (
    b.organizationId !== A ||
    b.partyId !== partyId ||
    b.version !== (create ? 1 : 2) ||
    b.visible !== 1
  )
    fail("F5.2 party material readback mismatch");
  if (destination === "V123") {
    checkAuditF52(b, partyId, create ? "ContratanteCriado" : "ContratanteAtualizado", "520");
  } else if (destination === "V104" || destination === "V106") {
    if (b.resultId !== fixtureId("a", "520", 2) || b.relatedPartyId !== partyId)
      fail("F5.2 party contract reference changed");
  } else if (b.resultId !== partyId) {
    fail("F5.2 party consumer did not return the written record");
  }
}
function checkDashboardF52(b, create) {
  const before = b.before;
  const after = b.summary;
  if (
    !record(before) ||
    !record(after) ||
    before.visible !== (create ? 0 : 1) ||
    before.active !== (create ? 0 : 1) ||
    before.group !== (create ? null : "ativo") ||
    after.visible !== 1 ||
    after.active !== 0 ||
    after.group !== (create ? "rascunho" : "suspenso") ||
    b.denialRendered !== false
  )
    fail("F5.2 dashboard totals or grouping mismatch");
}
function checkContract(o, id) {
  const create = ["0132", "0136", "0139", "0140"].includes(id);
  const association = id === "0136";
  const transition = id === "0146";
  const producer = create
    ? "contratos"
    : transition
      ? "rpc/alterar_situacao_contrato_v1"
      : "rpc/atualizar_contrato_v1";
  const { destination } = checkScopeF52(
    o,
    id,
    producer,
    create ? "create" : transition ? "transition" : "update",
    association,
  );
  const b = o.readback;
  const contractId = fixtureId("a", "521", 1);
  const partyId = fixtureId("a", "521", 2);
  if (o.kind === "negative") {
    if (
      b.ownMaterialId !== fixtureId("b", "521", 1) ||
      b.ownPartyId !== fixtureId("b", "521", 2) ||
      b.attemptedOrganization !== (association ? B : A) ||
      b.attemptedPartyId !== (association ? partyId : undefined) ||
      (destination === "SYS05" && (b.denialRendered !== true || b.summary !== undefined))
    )
      fail("F5.2 negative contract effect or scope mismatch");
    return;
  }
  if (
    b.organizationId !== A ||
    b.contractId !== contractId ||
    b.partyId !== partyId ||
    b.version !== (create ? 1 : 2) ||
    b.situation !== (create ? "rascunho" : transition ? "suspenso" : "ativo") ||
    b.requestId !== (create ? undefined : fixtureId("a", "521", 5))
  )
    fail("F5.2 contract identity, version or association mismatch");
  if (destination === "SYS05") {
    checkDashboardF52(b, create);
  } else if (destination === "V123") {
    checkAuditF52(
      b,
      contractId,
      create ? "ContratoCriado" : "CadastroOperacionalAtualizado",
      "521",
    );
  } else if (Object.hasOwn(downstreamReads, destination)) {
    if (
      b.downstream !== downstreamReads[destination] ||
      b.resultId !== (destination === "V113" ? contractId : fixtureId("a", "521", 6))
    )
      fail("F5.2 downstream contract link mismatch");
  } else if (b.resultId !== contractId) {
    fail("F5.2 contract consumer did not return the written contract");
  }
}
function checkNormative(o, id) {
  const c = f53Cases.get(id);
  const domain = normativeStates[c?.origin];
  if (!domain) fail("F5.3 canonical origin missing");
  checkScopedChange(o, c, "rpc/" + c.producer, c.origin === "V107" ? "apply" : "publish", "F5.3");
  const b = o.readback;
  const a = (number) => fixtureId("a", "530", number);
  const other = (number) => fixtureId("b", "530", number);
  if (o.kind === "negative") {
    if (
      b.downstreamId !== undefined ||
      b.ownMaterialId !== other(domain.ref) ||
      b.ownVersionId !== other(domain.version) ||
      b.ownContractId !== other(1) ||
      b.targetMaterialId !== a(domain.ref) ||
      b.targetState !== domain.initial ||
      (id === "0232" && b.rejectedHashAsConflict !== true) ||
      (id === "0264" && b.transportSeparated !== true)
    )
      fail("F5.3 foreign exposure, changed target or missing denial controls");
    return;
  }
  const expectedHash = createHash("sha256").update(domain.hashSeed).digest("hex");
  if (
    b.organizationId !== A ||
    b.contractId !== a(1) ||
    b.ref !== a(domain.ref) ||
    b.version !== a(domain.version) ||
    b.validFrom !== "2026-11-01" ||
    b.checksum !== expectedHash ||
    b.previousState !== domain.initial ||
    b.state !== domain.changed ||
    b.downstreamId !== a(normativeConsumers[c.destination])
  )
    fail("F5.3 material version, checksum or consumer mismatch");
  if (
    (c.origin === "V108" && (b.linkedItem !== a(23) || b.sourceDocId !== a(24))) ||
    (c.origin === "V109" &&
      (b.linkedItem !== a(33) || b.sourceRef !== a(12) || b.requestId !== a(52))) ||
    (c.origin !== "V109" && b.correlation !== a(51))
  )
    fail("F5.3 source, linked item or request mismatch");
  if (c.destination === "V123") {
    if (
      b.eventName !== c.conditionalEvent ||
      b.eventEntity !== a(domain.ref) ||
      b.correlation !== a(51)
    )
      fail("F5.3 audit lineage mismatch");
    return;
  }
  const snapshotHash = createHash("sha256").update("Histórico F5.3 a").digest("hex");
  if (
    (["V109", "V113", "V116", "V117"].includes(c.destination) && b.downstreamSource !== a(12)) ||
    (["V113", "V116", "V117", "V118"].includes(c.destination) && b.snapshot !== snapshotHash) ||
    (["V114", "V118", "V119"].includes(c.destination) &&
      (b.previousCanPresent !== true || b.canPresent !== false)) ||
    (c.destination === "V115" && b.missing !== true) ||
    (c.destination === "V116" && (b.previousStale !== false || b.stale !== true))
  )
    fail("F5.3 consumer history or current state mismatch");
}
function checkDocuments(o, id) {
  const c = f54Cases.get(id);
  if (!c) fail("F5.4 canonical connection missing");
  const competence = c.origin === "V115";
  const revision = c.origin === "V111";
  checkScopedChange(o, c, c.producer, revision ? "add_version" : "create", "F5.4");
  const b = o.readback;
  const series = competence ? "542" : "541";
  const a = (n) => fixtureId("a", series, n);
  const other = (n) => fixtureId("b", series, n);
  const checksum = (seed) => createHash("sha256").update(seed).digest("hex");
  const hash = checksum(competence ? "Documento V115 a" : "%PDF-1.4\nF5.4 a");
  const prior = checksum(competence ? "Evidência anterior V115 a" : "versão anterior a");
  if (o.kind === "negative") {
    if (
      b.ownMaterialId !== other(2) ||
      b.ownContractId !== other(1) ||
      b.targetNumber !== Number(revision) ||
      b.ownSha256 !== checksum(competence ? "Documento V115 b" : "versão anterior b") ||
      (competence
        ? b.ownCompetenceId !== other(7)
        : b.ownVersionId !== other(5) || b.urlOpened !== false) ||
      (id === "0288" && b.uploadDenied !== true) ||
      (id === "0315" &&
        (b.classifiedConflict !== "conflito" || b.classifiedTransport !== "erro")) ||
      (id === "0415" && b.crossedRequirementRejected !== true)
    )
      fail("F5.4 denial or unchanged document scope mismatch");
    return;
  }
  if (
    b.organizationId !== A ||
    b.contractId !== a(1) ||
    b.documentId !== a(2) ||
    b.versionId !== a(3) ||
    b.fileId !== a(4) ||
    b.sha256 !== hash ||
    b.number !== (revision ? 2 : 1) ||
    (revision && (b.oldVersionId !== a(5) || b.oldFileId !== a(6) || b.oldHash !== prior)) ||
    (competence && (b.competenceId !== a(7) || b.requirementId !== a(8)))
  )
    fail("F5.4 document, file, checksum or version mismatch");
  const consumers = {
    V107: 13,
    V110: 2,
    V111: 2,
    V114: 7,
    V116: 7,
    V117: 8,
    V118: 15,
    V119: 7,
    V123: 10,
  };
  if (b.resultId !== a(consumers[c.destination])) fail("F5.4 consumer identity mismatch");
  switch (c.destination) {
    case "V107":
      if (b.sourceVersion !== a(14) || b.sourceHash !== hash || b.page !== 2)
        fail("F5.4 source lineage mismatch");
      break;
    case "V110":
    case "V111":
      if (b.downloadVerified !== true || (id === "0288" && b.uploadVerified !== true))
        fail("F5.4 file transport not witnessed");
      break;
    case "V114":
    case "V118":
    case "V119":
      if (
        b.priorCanPresent !== true ||
        b.canPresent !== false ||
        (c.destination === "V118" && b.previousHash !== prior)
      )
        fail("F5.4 current gate or prior opinion mismatch");
      break;
    case "V116":
      if (b.stale !== true || b.previousHash !== prior || (competence && b.priorStale !== false))
        fail("F5.4 analysis scope mismatch");
      break;
    case "V117":
      if (b.retainedVersion !== a(5) || (competence ? b.previousHash !== prior : b.page !== 1))
        fail("F5.4 historical evidence mismatch");
      break;
    case "V123":
      if (
        b.event !== c.conditionalEvent ||
        b.entityId !== a(revision ? 3 : 2) ||
        b.correlation !== a(11)
      )
        fail("F5.4 audit lineage mismatch");
      break;
  }
}
function checkAction(o, id) {
  const [frontier, operation, allowedRole] = actionContracts[id];
  const positive = o.kind === "positive";
  const anonymous = !positive && id === "0067";
  const crossAssociation = !positive && id === "0049";
  const role = positive
    ? allowedRole
    : anonymous
      ? "anon"
      : crossAssociation
        ? "gestor_contrato"
        : "leitor";
  const tenant = positive ? A : anonymous ? null : B;
  const actor = positive ? U : anonymous ? null : V;
  if (
    o.frontier !== frontier ||
    o.operation !== operation ||
    o.role !== role ||
    o.target !== A ||
    o.actor !== actor ||
    o.tenant !== tenant ||
    o.decision !== (positive ? "ALLOW" : "DENY")
  )
    fail("action actor/tenant/frontier mismatch");
  const b = o.readback;
  if (
    b.selected !== tenant ||
    b.foreignVisible !== false ||
    !Array.isArray(b.operations) ||
    !b.operations.includes(frontier)
  )
    fail("action context or material boundary mismatch");
  if (positive) {
    if (!uuid(b.materialId)) fail("action material identity missing");
  } else if (
    !uuid(b.ownMaterialId) ||
    b.mutationCount !== 0 ||
    b.status !== (crossAssociation ? 409 : 403) ||
    b.code !== (crossAssociation ? "23503" : "42501")
  ) {
    fail("invalid action denial or effect");
  }
}
function checkAdm(o, id) {
  const canonical = admContracts.get(id);
  if (!canonical) fail("missing ADM01 canonical contract");
  const { resource, action, allowedProfiles } = canonical;
  const positive = o.kind === "positive";
  const frontier =
    id === "0002"
      ? "listar_organizacoes_disponiveis"
      : id === "0033"
        ? "eventos_auditoria"
        : "consultar_permissoes_efetivas";
  const allowedRole =
    resource === "auditoria"
      ? "administrador"
      : action === "consultar"
        ? "leitor"
        : "gestor_contrato";
  const decision = positive ? "ALLOW" : id === "0002" ? "ISOLATED" : "DENY";
  if (
    o.resource !== resource ||
    o.operation !== action ||
    o.frontier !== frontier ||
    o.role !== (positive ? allowedRole : "leitor") ||
    !allowedProfiles.includes(allowedRole) ||
    o.actor !== (positive ? U : V) ||
    o.tenant !== (positive ? A : B) ||
    o.target !== A ||
    o.decision !== decision
  )
    fail("ADM01 actor/tenant/permission mismatch");
  const b = o.readback;
  if (b.foreignVisible !== false) fail("ADM01 material exposed");
  if (positive) {
    if (b.bindingVersion !== 2 || !uuid(b.materialId) || !uuid(b.correlationId))
      fail("ADM01 binding/readback identity missing");
  } else if (b.status !== 403 || b.code !== "42501" || b.mutationCount !== 0) {
    fail("invalid ADM01 denial or effect");
  }
}
function checkRead(batch, o, id) {
  const positive = o.kind === "positive";
  const frontier = readFrontiers[batch][id];
  if (
    o.frontier !== frontier ||
    o.operation !== "read" ||
    o.role !== "leitor" ||
    o.target !== A ||
    o.actor !== (positive ? U : V) ||
    o.tenant !== (positive ? A : B) ||
    o.decision !== (positive ? "ALLOW" : "DENY")
  )
    fail("read actor/tenant/frontier mismatch");
  const b = o.readback;
  if (b.selected !== o.tenant || b.foreignVisible !== false)
    fail("read context or exposure mismatch");
  if (positive) {
    if (!uuid(b.materialId)) fail("read material identity missing");
    if (batch === "competence") {
      if (b.organizationId !== A || b.competenceId !== "a6000000-0000-4000-8000-000000000002")
        fail("read competence identity mismatch");
    } else {
      const queries = id === "0055" ? [frontier, "versoes_documento", "arquivos"] : [frontier];
      if (
        b.contractId !== "a7000000-0000-4000-8000-000000000001" ||
        JSON.stringify(b.queries) !== JSON.stringify(queries)
      )
        fail("data read boundary mismatch");
    }
    return;
  }
  if (b.status !== 403 || b.code !== "42501" || b.mutationCount !== 0)
    fail("read was not denied at the authorized boundary");
  if (batch === "competence") {
    if (
      b.classified !== "sem_permissao" ||
      b.ownCompetenceId !== "b6000000-0000-4000-8000-000000000002" ||
      b.targetCompetenceId !== "a6000000-0000-4000-8000-000000000002"
    )
      fail("invalid competence denial");
  } else {
    const classified = ["0062", "0064"].includes(id) ? "sem_permissao" : "negado";
    if (
      b.classified !== classified ||
      !uuid(b.ownMaterialId) ||
      JSON.stringify(b.queries) !== JSON.stringify([frontier])
    )
      fail("invalid data denial");
  }
}
function checkContext(o, id) {
  const r = rules[id]?.[o.kind];
  if (!r || Object.entries(r).some(([k, v]) => o[k] !== v) || o.role !== "leitor")
    fail("context actor/tenant/operation mismatch");
  const b = o.readback;
  if (o.kind === "positive") {
    if (b.visible !== true || b.selected !== o.target || b.foreignVisible !== false)
      fail("positive readback mismatch");
    if (id === "0005" && (b.bindingVersion !== 2 || !uuid(b.bindingCorrelationId)))
      fail("dashboard binding not observed");
  } else {
    if (b.foreignVisible !== false || b.mutationCount !== 0) fail("negative leak/effect");
    if (
      o.decision === "DENY" &&
      (b.status !== 403 || b.code !== "42501" || b.denialRendered !== true)
    )
      fail("not an authorization denial");
    if (o.decision === "ISOLATED" && (b.isolationObserved !== true || b.oldCacheRendered !== false))
      fail("isolation not observed");
    if (id === "0005" && (b.bindingStatus !== 403 || b.bindingCode !== "42501"))
      fail("dashboard binding denial not observed");
  }
}
export function validateMaterial(batch, observations, report, identity) {
  if (!Object.hasOwn(BATCHES, batch)) fail("unknown batch");
  const contract = batchesWithEvidence[batch];
  if (!contract) fail("batch oracle not implemented; no receipt");
  if (
    !sha(identity?.frontend) ||
    identity.backend !== BACKEND ||
    !sha(identity.harness) ||
    ![identity.run, identity.attempt, identity.job].every(num)
  )
    fail("invalid execution identity");
  const expected = BATCHES[batch].flatMap((id) =>
    ["positive", "negative"].map((kind) => "IFV1-F5-C" + id + ":" + kind),
  );
  const keys = new Set(expected);
  if (!Array.isArray(observations) || observations.length !== keys.size)
    fail("incomplete observations");
  const seen = new Set();
  for (const o of observations) {
    const key = o?.caseId + ":" + o?.kind;
    if (
      !keys.has(key) ||
      seen.has(key) ||
      o.mode !== "CODE_FIXTURE" ||
      !record(o.readback) ||
      Object.keys(o.readback).length === 0
    )
      fail("invalid/duplicate observation");
    if (
      o.frontend !== identity.frontend ||
      o.backend !== identity.backend ||
      o.harness !== identity.harness ||
      o.run !== identity.run ||
      o.attempt !== identity.attempt ||
      o.job !== identity.job
    )
      fail("observation execution identity mismatch");
    contract.check(o, o.caseId.slice(-4));
    seen.add(key);
  }
  if (
    report?.success !== true ||
    report.numTotalTests !== keys.size ||
    report.numPassedTests !== keys.size ||
    report.numFailedTests !== 0 ||
    report.numPendingTests !== 0 ||
    report.numTodoTests !== 0 ||
    !Array.isArray(report.testResults) ||
    report.testResults.length !== 1
  )
    fail("incomplete test report");
  const result = report.testResults[0];
  if (result.status !== "passed" || !result.name?.endsWith("/src/test/" + contract.file))
    fail("test file identity mismatch");
  const assertions = result.assertionResults ?? [];
  if (assertions.length !== keys.size) fail("assertion cardinality");
  const tested = new Set();
  for (const t of assertions) {
    const m = /^(IFV1-F5-C\d{4}) (positive|negative): .+$/.exec(t.title ?? "");
    const k = m ? m[1] + ":" + m[2] : "";
    if (
      t.status !== "passed" ||
      !keys.has(k) ||
      tested.has(k) ||
      t.ancestorTitles?.length !== 1 ||
      t.ancestorTitles[0] !== contract.suite ||
      t.title !==
        m[1] + " " + m[2] + ": " + contract.title(m[1].slice(-4), m[2] === "positive" ? 0 : 1)
    )
      fail("invalid/duplicate test");
    tested.add(k);
  }
  return {
    schema: "contaos.ifv1.f5.material-partial.v1",
    batch,
    covered: keys.size / 2,
    proofs: keys.size,
    phaseTotal: 138,
    scope: "CODE_FIXTURE",
    live: "NOT_RUN",
    certification: "NOT_CERTIFIED",
    ...identity,
  };
}
function main() {
  const [flag, batch] = process.argv.slice(2);
  if (flag !== "--batch") fail("usage: --batch <batch>");
  const dir = process.env.F5_OUTPUT_DIR || "artifacts/f5-code";
  const identity = {
    frontend: process.env.F5_FRONTEND_SHA,
    backend: BACKEND,
    harness: process.env.F5_HARNESS_SHA,
    run: process.env.GITHUB_RUN_ID,
    attempt: process.env.GITHUB_RUN_ATTEMPT,
    job: process.env.JOB_ID,
  };
  const ob = fs.readFileSync(path.join(dir, "observations.json")),
    rep = fs.readFileSync(path.join(dir, "vitest.json"));
  const receipt = validateMaterial(batch, JSON.parse(ob), JSON.parse(rep), identity);
  receipt.observationsSha256 = createHash("sha256").update(ob).digest("hex");
  receipt.reportSha256 = createHash("sha256").update(rep).digest("hex");
  fs.writeFileSync(path.join(dir, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n", {
    flag: "wx",
  });
  console.log(JSON.stringify(receipt));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

import { readFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const ledgerFile = "docs/frontend/auditorias/P0_V1_RASTREABILIDADE_COMPLETA_2026-11-05.json";
export const regularIds = [
  ...Array.from({ length: 44 }, (_, index) => String(index).padStart(2, "0")),
  "75",
];
export const atomicIds = [
  ...Array.from({ length: 25 }, (_, index) => String(index).padStart(3, "0")),
  ...Array.from({ length: 12 }, (_, index) => String(index + 85).padStart(3, "0")),
];
const finalPromptTests = {
  "39": "src/test/competenciaParecer.test.tsx",
  "40": "src/test/competenciaApresentar.test.tsx",
  "41": "src/test/competenciaProtocolo.test.tsx",
  "42": "src/test/historicoContrato.test.tsx",
  "43": "src/test/ingestaoHistorico.test.tsx",
  "75": "src/test/trilhaAuditoria.test.tsx",
};
const canonicalFinalCriteria = [
  "Rota abre corretamente",
  "Perfil autorizado consegue utilizar a funcionalidade",
  "Perfil não autorizado é bloqueado pelo backend/RLS",
  "Estados loading, empty e error são adequados",
  "Nenhuma requisição usa chave secreta",
  "Ações críticas não executam UPDATE direto",
  "Desktop 1440 e 1280 px preserva conteúdo",
  "Tablet 768 px preserva conteúdo",
  "Mobile 390 px preserva dados críticos",
  "Teclado, foco e labels acessíveis",
  "Console sem erros ou logs sensíveis",
  "Security scan sem novo Critical",
];
const recognizedGrades = new Set([
  "HISTORICA_ESCOPADA",
  "PARCIAL_OU_NAO_VERIFICADA",
  "SEM_PROVA_INDIVIDUAL",
]);

export function validateLedger(data) {
  const errors = [];
  function fail(condition, message) {
    if (condition) errors.push(message);
  }
  fail(data?.schema !== "contaos.v1.traceability.evidence.v1", "Schema inesperado.");
  fail(data?.source_catalog_blob !== "e54e49e626e65a9c94c81709180fd192a1f0c079", "Fonte original 100/97 alterada sem plano.");
  fail(data?.source_matrix_blob !== "f0c734dc4fb0227ae21bbac7f716314dd65632a1", "Fonte legada 416 alterada sem plano.");
  fail(data?.source_backend_commit !== "3aa4af7a292b80243045e0a426ee6399ba948ff2", "Baseline normativo divergente.");
  const regular = Array.isArray(data?.regular) ? data.regular : [];
  const atomic = Array.isArray(data?.atomic) ? data.atomic : [];
  fail(JSON.stringify(regular.map((r) => r.id)) !== JSON.stringify(regularIds), "Lista ou ordem de 45 regulares V1 incorreta.");
  fail(JSON.stringify(atomic.map((a) => a.atomic_id)) !== JSON.stringify(atomicIds), "Lista ou ordem de 37 atômicos V1/NFR incorreta.");
  fail(new Set(regular.map((r) => r.id)).size !== regular.length, "ID regular duplicado.");
  fail(new Set(atomic.map((a) => a.atomic_id)).size !== atomic.length, "ID atômico duplicado.");
  fail(data?.count_regular !== 45 || data?.count_legacy_criteria !== 416 ||
    data?.count_atomic_v1_brand !== 25 || data?.count_nfr !== 12, "Contadores de controle divergentes.");
  const original = [];
  for (const r of regular) {
    fail(r.source_verified !== true, "Fonte não comprovada: regular " + r.id);
    fail(!Array.isArray(r.canonical_atomic_ids), "Crosswalk ausente: regular " + r.id);
    for (const id of r.canonical_atomic_ids || []) {
      fail(!/^\d{3}$/.test(id) || Number(id) > 96, "ID atômico incorreto: " + r.id + "/" + id);
    }
    fail(!Array.isArray(r.criteria) || r.criteria_count !== r.criteria?.length,
      "Critérios/contagem inconsistentes: regular " + r.id);
    fail(r.certification_eligible !== false, "Regular certificado sem certificado formal: " + r.id);
    fail(!Array.isArray(r.latest_evidence_docs) || r.latest_evidence_docs.length < 1,
      "Sem fonte/dossiê indicado: " + r.id);
    if (Number(r.id) <= 38) original.push(...(r.criteria || []).map((c) => ({...c, prompt:r.id})));
    else {
      fail(r.criteria_count !== 12 || r.criteria?.length !== 12,
        "Prompts finais exigem 12 critérios cada: " + r.id);
      fail(r.criterion_indexing_status !== "DOZE_CRITERIOS_NORMALIZADOS_NAO_TRANSCRICAO_LITERAL_INTEGRAL",
        "Origem normalizada não foi declarada: " + r.id);
      const expectedTestFile = finalPromptTests[r.id];
      fail(!expectedTestFile, "Prompt final não consta da allowlist: " + r.id);
      let sourceTest = "";
      if (expectedTestFile && existsSync(expectedTestFile)) {
        sourceTest = readFileSync(expectedTestFile, "utf8");
      } else {
        fail(true, "Arquivo de teste final ausente: " + r.id);
      }
      const seenFinalIds = new Set();
      for (const criterion of r.criteria || []) {
        const key = r.id + ":" + criterion.index;
        fail(seenFinalIds.has(criterion.index), "Critério final duplicado: " + key);
        seenFinalIds.add(criterion.index);
        fail(criterion.index < 1 || criterion.index > 12 ||
          criterion.text !== canonicalFinalCriteria[criterion.index - 1],
          "Critério final ausente ou alterado: " + key);
        fail(criterion.criterion_origin !==
          "PROTOCOLO_12_ITENS_VERIFICADO_NO_PROMPT_41_COM_CROSSWALK_NORMALIZADO" ||
          criterion.source_protocol !==
          "docs/frontend/fontes/PROMPT_41_V120_TEXTO_ORIGINAL_VERIFICADO_2026-11-04.md" ||
          !criterion.prompt_specific_source || !criterion.implementation_route,
          "Critério final sem fonte/escopo: " + key);
        fail(criterion.test_file !== expectedTestFile ||
          !/^[0-9a-f]{40}$/.test(criterion.test_file_blob_sha || ""),
          "Teste final sem vínculo verificável: " + key);
        fail(!Array.isArray(criterion.indicative_test_titles) ||
          (criterion.indicative_test_titles || []).some((title) => !sourceTest.includes(title)),
          "Título de teste indicativo sem correspondência no código: " + key);
        fail(criterion.certified !== false || !criterion.proof_grade ||
          !criterion.evidence_scope,
          "Critério final promovido ou sem limites de prova: " + key);
      }
    }
  }
  fail(original.length !== 416, "Esperados 416 critérios originais 00–38.");
  fail(data?.count_final_normalized_criteria !== 72 ||
    data?.coverage?.final_normalized_criteria_indexed !== 72 ||
    data?.coverage?.criteria_total_indexed !== 488,
    "Cobertura dos 72 critérios finais ou total 488 divergente.");

  const distinct = new Set();
  const grades = {};
  for (const criterion of original) {
    const key = criterion.prompt + ":" + criterion.index;
    fail(distinct.has(key), "Critério duplicado: " + key);
    distinct.add(key);
    fail(!criterion.text || !criterion.legacy_status, "Critério sem fonte/status: " + key);
    fail(!Array.isArray(criterion.legacy_proofs), "Prova não estruturada: " + key);
    fail(!recognizedGrades.has(criterion.proof_grade), "Classificação inválida: " + key);
    fail(criterion.proof_grade === "HISTORICA_ESCOPADA" && !criterion.legacy_proofs?.length,
      "PASS histórico sem referência: " + key);
    fail(criterion.certified === true, "Critério promovido a certificado sem rito formal: " + key);
    grades[criterion.proof_grade] = (grades[criterion.proof_grade] || 0) + 1;
  }
  fail(JSON.stringify(grades) !== JSON.stringify(data?.coverage?.proof_grade_totals),
    "Classificação/resumo não bate com as 416 linhas.");
  fail(data?.coverage?.regular_indexed !== 45 ||
       data?.coverage?.legacy_criteria_indexed !== 416 ||
       data?.coverage?.atomic_indexed !== 37, "Cobertura numérica adulterada.");
  for (const a of atomic) {
    fail(!a.source || !a.requirement_id || !a.required_test, "Atômico sem fonte/teste: " + a.atomic_id);
    fail(a.certified === true, "Atômico promovido sem certificação: " + a.atomic_id);
    fail(!Array.isArray(a.regular_ids), "Atômico sem crosswalk: " + a.atomic_id);
    if (Number(a.atomic_id) >= 85) {
      fail(a.applies_to_v1 !== true || a.applicability_status !== "TRANSVERSAL_V1_PENDENTE_PROVA_REAL",
        "RNF transversal ignorado: " + a.atomic_id);
    } else if (a.atomic_id !== "000") {
      fail(a.regular_ids.length === 0, "Atômico funcional sem correspondência V1: " + a.atomic_id);
    }
  }
  fail(JSON.stringify(Object.keys(data?.exception_policy || {}).sort()) !==
      JSON.stringify(["R01", "R02", "R03", "automatic_exception_broadening"].sort()),
      "Exceções aumentadas indevidamente.");
  fail(data?.exception_policy?.automatic_exception_broadening !== false,
      "Alargamento automático de exceção proibido.");
  fail(data?.attestation?.functional_certification !==
      "PENDING_REAL_TESTS_AND_INDIVIDUAL_ACCEPTANCE",
      "Certificação funcional declarada sem prova.");
  fail(data?.attestation?.v2_locked !== true || data?.attestation?.prod_untouched !== true,
      "Controle V1 primeiro/PROD alterado.");
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ledger = JSON.parse(readFileSync(ledgerFile, "utf8"));
  const issues = validateLedger(ledger);
  if (issues.length) {
    for (const issue of issues) console.error("P0 V1 TRACEABILITY FAIL: " + issue);
    process.exit(1);
  }
  console.log("P0 V1 TRACEABILITY PASS: 45 regulares, 416 critérios legados + 72 finais normalizados, 25 atômicos V1/BRAND, 12 NFR; sem PASS fabricado.");
  console.log("LIMITAÇÃO: 72 itens são critérios normalizados, não transcrição literal integral nem prova HML autenticada.");
}

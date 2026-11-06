import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const CERTIFIED_TYPES_BLOB = "8ea7750b75fd9d76b29c36ce7613392e3ab65e19";
const COMPONENTS = [
  "src/routes/login.tsx",
  "src/routes/esqueci-senha.tsx",
  "src/routes/redefinir-senha.tsx",
  "src/routes/selecionar-organizacao.tsx",
  "src/components/dashboard/Dashboard.tsx",
  "src/components/contratantes/ListaContratantes.tsx",
  "src/components/contratantes/NovoContratante.tsx",
  "src/components/contratantes/EditarContratante.tsx",
  "src/components/contratos/ListaContratos.tsx",
  "src/components/contratos/NovoContrato.tsx",
  "src/components/contratos/VisaoGeralContrato.tsx",
  "src/components/contratos/BaseNormativaContrato.tsx",
  "src/components/administracao/usuarios/AdminUsuarios.tsx",
  "src/components/contratos/OrcamentoContrato.tsx",
  "src/components/contratos/RegrasContrato.tsx",
  "src/components/contratos/DocumentosContrato.tsx",
  "src/components/contratos/DocumentoDetalhe.tsx",
  "src/components/contratos/CompetenciasContrato.tsx",
  "src/components/contratos/NovaCompetencia.tsx",
  "src/components/competencias/CompetenciaVisaoGeral.tsx",
  "src/components/competencias/CompetenciaDocumentos.tsx",
  "src/components/competencias/CompetenciaAnalise.tsx",
  "src/components/competencias/CompetenciaParecer.tsx",
  "src/components/competencias/CompetenciaApresentar.tsx",
  "src/components/competencias/CompetenciaProtocolo.tsx",
  "src/components/contratos/HistoricoContrato.tsx",
  "src/components/contratos/ImportarHistorico.tsx",
  "src/components/administracao/auditoria/TrilhaAuditoria.tsx",
];

const problems = [];
function source(path) {
  if (!existsSync(path)) {
    problems.push("Arquivo obrigatório ausente: " + path);
    return "";
  }
  return readFileSync(path, "utf8");
}
const root = source("src/routes/__root.tsx");
if (!root.includes('<html lang="pt-BR">'))
  problems.push("Documento HTML deve declarar lang=pt-BR.");
for (const english of [
  "Page not found",
  "Go home",
  "This page didn't load",
  "Something went wrong on our end",
  "Try again",
]) {
  if (root.includes(english))
    problems.push("Texto global em inglês no root: " + english);
}

const brandTest = source("src/test/brand.test.tsx");
// A marca das páginas organizacionais vem do shell, não de cabeçalhos duplicados.
const shell = source("src/components/layout/ContaOSAppShell.tsx");
if (!root.includes("<ContaOSAppShell>") || !root.includes("<Outlet />"))
  problems.push("Root sem AppShell compartilhado e Outlet.");
for (const required of [
  "<ContaOSOrganizationHeader",
  "<ContaOSSidebar",
  "/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg",
  "/brand/ContaOS_Simbolo_Branco.svg",
])
  if (!shell.includes(required))
    problems.push("Shell sem apresentação/marca oficial: " + required);

for (const path of COMPONENTS) {
  const code = source(path);
  if (path.startsWith("src/routes/")) {
    if (!code.includes("<ContaOSMarca"))
      problems.push("Tela de acesso/seletor sem marca oficial: " + path);
  } else if (code.includes("<ContaOSMarca")) {
    problems.push("Marca duplicada fora da sidebar organizacional: " + path);
  }
  if (!brandTest.includes(path))
    problems.push("Tela ausente da proteção do teste BRAND-01: " + path);
  if (/#[0-9a-fA-F]{6}\b/.test(code))
    problems.push(
      "Cor hexadecimal fixa encontrada em tela, auditar token: " + path,
    );
  if (code.includes("sb_secret_") || code.includes("service_role"))
    problems.push("Possível secret literal em tela: " + path);
}

const expectedAssets = [
  "public/brand/ContaOS_Logo_Horizontal_Mono_Branco.svg",
  "public/brand/ContaOS_Simbolo_Branco.svg",
  "public/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg",
  "public/brand/ContaOS_Simbolo_Navy.svg",
  "public/favicon.svg",
];
// Os dois SVGs de fundo claro são oficiais do pacote BRAND v1.0: nunca gerar/recolorir.
// SHA-256 garante cópia literal dos arquivos originais.
const navySha = {
  "public/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg":
    "bd924993afbb620647d1053614688efea1f157523cbf41b3c36a368b0d0c976c",
  "public/brand/ContaOS_Simbolo_Navy.svg":
    "5773eb79ade28369b1efd457bf3b69b70f79a9ede87a05aa5e622f44d56e3252",
};
const brandComponent = source("src/components/brand/ContaOSMarca.tsx");
for (const required of [
  "/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg",
  "/brand/ContaOS_Simbolo_Navy.svg",
]) {
  if (!brandComponent.includes(required))
    problems.push(
      "Componente de marca não seleciona variante oficial para fundo claro: " +
        required,
    );
}
if (!brandComponent.includes("dark:"))
  problems.push(
    "Seleção responsiva da marca não acompanha explicitamente tema escuro.",
  );

const { createHash } = await import("node:crypto");
for (const [asset, sha] of Object.entries(navySha)) {
  if (existsSync(asset)) {
    const hex = createHash("sha256").update(readFileSync(asset)).digest("hex");
    if (hex !== sha)
      problems.push(
        "Asset BRAND-01 de fundo claro não coincide com o SHA original: " +
          asset,
      );
  }
}
for (const p of expectedAssets)
  if (!existsSync(p)) problems.push("Asset oficial não encontrado: " + p);

let actualBlob = "";
try {
  actualBlob = execFileSync(
    "git",
    ["hash-object", "src/integrations/supabase/types.ts"],
    {
      encoding: "utf8",
    },
  ).trim();
} catch {
  problems.push("Não foi possível verificar o blob do types.ts.");
}
if (actualBlob !== CERTIFIED_TYPES_BLOB)
  problems.push(
    "DRIFT CRÍTICO: types.ts não coincide com o blob certificado. Atual=" +
      actualBlob,
  );

// Regras de economia: nenhum teste precisa acessar Supabase, alterar arquivos ou usar créditos Lovable.
// Este gate não certifica screenshots reais, RLS de sessão nem auditoria semântica de 197 prompts.
if (problems.length) {
  for (const item of problems) console.error("ZERO-DRIFT FAIL: " + item);
  process.exit(1);
}
console.log(
  "ZERO-DRIFT PASS: " +
    COMPONENTS.length +
    " telas com marca pública ou compartilhada no menu, teste BRAND-01, pt-BR global, blobs/ativos oficiais e types.ts imutável.",
);
console.log(
  "LIMITAÇÃO: captura visual dinâmica e estados autenticados são verificados em Teste C independente.",
);

// BRAND-01 — Identidade Visual Oficial ContaOS v1.0 (exclusivamente visual).
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { ContaOSMarca } from "@/components/brand/ContaOSMarca";

const raiz = resolve(__dirname, "../..");
const ler = (p: string) => readFileSync(resolve(raiz, p), "utf8");

// SHA-256 do MANIFEST_SHA256_v4_1_BRAND_v1_0.json oficial.
const ASSETS_OFICIAIS: Record<string, string> = {
  "public/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg":
    "bd924993afbb620647d1053614688efea1f157523cbf41b3c36a368b0d0c976c",
  "public/brand/ContaOS_Simbolo_Navy.svg":
    "5773eb79ade28369b1efd457bf3b69b70f79a9ede87a05aa5e622f44d56e3252",
  "public/brand/ContaOS_Logo_Horizontal_Mono_Branco.svg":
    "099518bc6ff6b83d4380071b99410dbbbdb43805790c7ad6b0437ba16ae14c36",
  "public/brand/ContaOS_Simbolo_Branco.svg":
    "7de27bd24a220d9d8e6b7bb2352e9ba895109e3f648401f5cc454fff1873e3fc",
  "public/favicon.svg": "b659af3ca70eaa47cfa67c0115a394c23448f091ba9ded7cb3a15b5702c1c907",
  "public/favicon.ico": "9d1705a8e8a446b33e3f907adf9b4d5f8d137af3ead8f81d217f6eaa99c3121f",
  "public/favicon-16x16.png": "700d6d663f22e5cee0d0566f41aac972dc96504da81035ca53a1c5a9724ddf3d",
  "public/favicon-32x32.png": "393b2cb1424baa86e05f7320285d62a4e159ab3f99caf37b4b9f73168fc02d37",
  "public/favicon-48x48.png": "3a2e17b6535c59feafdb0196b026d1481a36c181fc0ad0f4548dbd4ccb655cbc",
};

const ARQUIVOS_MARCA = [
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
];

describe("BRAND-01 — componente de marca", () => {
  it("usa o logo horizontal oficial para fundo escuro com alt ContaOS", () => {
    const { container } = render(<ContaOSMarca />);
    const logo = container.querySelector(
      'img[src="/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg"]',
    );
    expect(logo).not.toBeNull();
    expect(logo?.getAttribute("alt")).toBe("ContaOS");
  });

  it("usa o símbolo oficial branco decorativo no mobile, com o nome em texto", () => {
    const { container } = render(<ContaOSMarca />);
    const simbolo = container.querySelector('img[src="/brand/ContaOS_Simbolo_Branco.svg"]');
    expect(simbolo).not.toBeNull();
    expect(simbolo?.getAttribute("alt")).toBe("");
    expect(container.textContent).toContain("ContaOS");
  });
});

describe("BRAND-01 — contraste no tema escuro", () => {
  it("usa as variantes navy oficiais para superfícies claras e classe dark", () => {
    const { container } = render(<ContaOSMarca />);
    const logoNavy = container.querySelector(
      'img[src="/brand/ContaOS_Logo_Horizontal_Mono_Navy.svg"]',
    );
    const simboloNavy = container.querySelector('img[src="/brand/ContaOS_Simbolo_Navy.svg"]');
    expect(logoNavy).not.toBeNull();
    expect(logoNavy?.getAttribute("alt")).toBe("ContaOS");
    expect(logoNavy?.getAttribute("class")).toContain("dark:block");
    expect(simboloNavy).not.toBeNull();
    expect(simboloNavy?.getAttribute("alt")).toBe("");
    expect(simboloNavy?.getAttribute("class")).toContain("dark:block");
    const logoBranco = container.querySelector(
      'img[src="/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg"]',
    );
    expect(logoBranco?.getAttribute("class")).toContain("dark:hidden");
  });
});

describe("BRAND-01 — aplicação nas telas", () => {
  it.each(ARQUIVOS_MARCA)("%s usa ContaOSMarca e não usa a marca provisória", (arquivo) => {
    const src = ler(arquivo);
    expect(src).toContain("<ContaOSMarca");
    // Ícones de status ShieldCheck são permitidos. Proibir apenas marca provisória
    // no lugar de ContaOSMarca, sem gerar falsos positivos em fluxos de segurança.
    expect(src).not.toMatch(/<ShieldCheck[^>]*\/>\s*<span[^>]*>ContaOS<\/span>/);
  });
});

describe("BRAND-01 — sem visual paralelo nas telas recentes", () => {
  const recentes = ARQUIVOS_MARCA.slice(-9);
  const violaCorDireta = (css: string) =>
    /(?:className|style)\s*=\s*["'`][^"'`]*#[0-9a-fA-F]{3,8}\b/.test(css) ||
    /\[(?:#)[0-9a-fA-F]{3,8}\]/.test(css);

  it("o detector de cores literais rejeita um exemplo sintético", () => {
    expect(violaCorDireta('className="bg-[#123456]"')).toBe(true);
    expect(violaCorDireta('className="bg-primary text-primary-foreground"')).toBe(false);
  });

  it.each(recentes)("%s preserva a identidade visual existente sem paleta paralela", (arquivo) => {
    const src = ler(arquivo);
    expect(src).toContain("<ContaOSMarca");
    expect(violaCorDireta(src)).toBe(false);
    expect(src).not.toMatch(/<img\s[^>]*src=["'](?!\/brand\/)/);
    expect(src).not.toMatch(/from\s+["'][^"']+\.css["']/);
    expect(src).not.toContain("fonts.googleapis");
    expect(src).not.toContain("createTheme(");
  });
});

describe("GOV-017 — SVG branco sem fundo para superficies compostas", () => {
  const original = "public/brand/ContaOS_Logo_Horizontal_Mono_Branco.svg";
  const transparente = "public/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg";
  const fundo = '<rect width="100%" height="100%" fill="#0F172A"/>';

  it("derivado preserva cada forma oficial e remove somente o fundo total", () => {
    const assetOriginal = ler(original);
    const assetTransparente = ler(transparente);
    expect(assetOriginal.split(fundo)).toHaveLength(2);
    expect(assetTransparente).toBe(assetOriginal.replace(fundo, ""));
    expect(assetTransparente).not.toContain(fundo);
    expect(assetTransparente).toContain('aria-label="ContaOS"');
  });

  it("a marca compartilhada usa somente a variante sem fundo", () => {
    const componente = ler("src/components/brand/ContaOSMarca.tsx");
    const { container } = render(<ContaOSMarca />);
    const logo = container.querySelector(
      'img[src="/brand/ContaOS_Logo_Horizontal_Mono_Branco_Transparente.svg"]',
    );
    expect(logo).not.toBeNull();
    expect(logo?.getAttribute("alt")).toBe("ContaOS");
    expect(componente).not.toContain('src="/brand/ContaOS_Logo_Horizontal_Mono_Branco.svg"');
  });

  it("V1-18 mantém a marca compartilhada e tokens sem paleta paralela", () => {
    const tela = ler("src/components/competencias/CompetenciaParecer.tsx");
    expect(tela).toContain("<ContaOSMarca");
    expect(tela).toContain("bg-primary text-primary-foreground");
    expect(tela).toContain("bg-background text-foreground");
    expect(tela).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(tela).not.toContain("fonts.googleapis");
    expect(tela).not.toContain("createTheme(");
  });
});

describe("BRAND-01 — head e assets", () => {
  it("root declara favicons oficiais, sem Lovable App e sem manifest", () => {
    const root = ler("src/routes/__root.tsx");
    expect(root).toContain('href: "/favicon.svg"');
    expect(root).toContain('href: "/favicon.ico"');
    expect(root).not.toContain("Lovable App");
    expect(root).not.toMatch(/rel:\s*"manifest"/);
  });

  it.each(Object.entries(ASSETS_OFICIAIS))("%s é byte a byte o asset oficial", (arquivo, sha) => {
    const hash = createHash("sha256")
      .update(readFileSync(resolve(raiz, arquivo)))
      .digest("hex");
    expect(hash).toBe(sha);
  });
});

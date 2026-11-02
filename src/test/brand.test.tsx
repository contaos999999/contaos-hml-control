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
  "public/brand/ContaOS_Logo_Horizontal_Fundo_Escuro.svg": "2d3c6c1a088a6f631acf2055a06a9e4b7bd81519cd83b2c9fed4fcf367815187",
  "public/brand/ContaOS_Simbolo_Branco.svg": "7de27bd24a220d9d8e6b7bb2352e9ba895109e3f648401f5cc454fff1873e3fc",
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
];

describe("BRAND-01 — componente de marca", () => {
  it("usa o logo horizontal oficial para fundo escuro com alt ContaOS", () => {
    const { container } = render(<ContaOSMarca />);
    const logo = container.querySelector('img[src="/brand/ContaOS_Logo_Horizontal_Fundo_Escuro.svg"]');
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

describe("BRAND-01 — aplicação nas telas", () => {
  it.each(ARQUIVOS_MARCA)("%s usa ContaOSMarca e não usa a marca provisória", (arquivo) => {
    const src = ler(arquivo);
    expect(src).toContain("<ContaOSMarca");
    expect(src).not.toMatch(/<ShieldCheck className="h-5 w-5" aria-hidden \/>/);
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
    const hash = createHash("sha256").update(readFileSync(resolve(raiz, arquivo))).digest("hex");
    expect(hash).toBe(sha);
  });
});

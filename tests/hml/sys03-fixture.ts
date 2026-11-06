/** SYS-03 HML only. Fail closed: no Auth requests or secrets printed. */
export const HML_PROJECT_REF = "gklhhhyosgasnyoxlrui";
export type Preflight = { ready: boolean; missing: string[] };
const REQUIRED = ["CONTAOS_HML_SUPABASE_URL", "CONTAOS_HML_SYNTHETIC_EMAIL", "CONTAOS_HML_SYNTHETIC_PASSWORD", "CONTAOS_HML_MAILBOX_TOKEN"] as const;
export function syntheticFixturePreflight(env: Record<string, string | undefined>): Preflight {
  const missing = REQUIRED.filter((key) => !env[key]?.trim()) as string[];
  const url = env.CONTAOS_HML_SUPABASE_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" || parsed.hostname !== HML_PROJECT_REF + ".supabase.co") missing.push("INVALID_HML_PROJECT");
    } catch { missing.push("INVALID_HML_PROJECT"); }
  }
  const email = env.CONTAOS_HML_SYNTHETIC_EMAIL;
  if (email && !email.toLowerCase().startsWith("contaos-sys03-")) missing.push("INVALID_SYNTHETIC_EMAIL_PREFIX");
  return { ready: missing.length === 0, missing };
}

import { supabase } from "@/integrations/supabase/client";

export interface EventoAuditoriaSeguro {
  id: string;
  criado_em: string;
  evento: string;
  entidade: string;
  origem: string;
  id_usuario: string | null;
  id_entidade: string | null;
  correlation_id: string;
}
export interface FiltrosAuditoria {
  idOrganizacao: string;
  pagina: number;
  limite?: number;
  evento?: string;
  entidade?: string;
  idUsuario?: string;
  correlationId?: string;
  dataInicial?: string;
  dataFinal?: string;
}

const CAMPOS = "id,criado_em,evento,entidade,origem,id_usuario,id_entidade,correlation_id" as const;
export async function obterEventosAuditoria(f: FiltrosAuditoria): Promise<{ eventos: EventoAuditoriaSeguro[]; total: number }> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(f.idOrganizacao)) {
    throw new Error("Selecione uma organização válida.");
  }
  if (!Number.isSafeInteger(f.pagina) || f.pagina < 0) throw new Error("Página inválida.");
  const limite = Math.max(1, Math.min(50, Number.isFinite(f.limite) ? Math.trunc(f.limite!) : 25));
  const inicio = f.pagina * limite;
  let consulta = supabase.from("eventos_auditoria")
    .select(CAMPOS, { count: "exact" })
    .eq("id_organizacao", f.idOrganizacao)
    .order("criado_em", { ascending: false })
    .order("id", { ascending: false })
    .range(inicio, inicio + limite - 1);
  if (f.evento?.trim()) consulta = consulta.eq("evento", f.evento.trim().slice(0, 120));
  if (f.entidade?.trim()) consulta = consulta.eq("entidade", f.entidade.trim().slice(0, 120));
  if (f.idUsuario?.trim()) consulta = consulta.eq("id_usuario", f.idUsuario.trim());
  if (f.correlationId?.trim()) consulta = consulta.eq("correlation_id", f.correlationId.trim());
  if (f.dataInicial) consulta = consulta.gte("criado_em", f.dataInicial);
  if (f.dataFinal) consulta = consulta.lte("criado_em", f.dataFinal);
  const { data, error, count } = await consulta;
  if (error) {
    if (error.code === "42501" || error.code === "PGRST301") throw new Error("Acesso não autorizado à trilha de auditoria.");
    throw new Error("Não foi possível consultar a trilha de auditoria.");
  }
  return { eventos: (data ?? []) as EventoAuditoriaSeguro[], total: count ?? 0 };
}

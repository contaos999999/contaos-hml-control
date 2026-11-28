import { supabase } from "@/integrations/supabase/client";
import { uuidCanonico, uuidValido } from "@/lib/contratos/contratoDetalheDados";

export const PAGINA_DILIGENCIAS = 25;
export const ROTULOS_CICLO = {
  aberto: "Aberto",
  em_tratamento: "Em tratamento",
  pronto_reapresentar: "Pronto para reapresentar",
  reapresentado: "Reapresentado",
  encerrado: "Encerrado",
} as const;

type StatusCiclo = keyof typeof ROTULOS_CICLO;
type TipoErro = "sem_permissao" | "nao_encontrado" | "invalido" | "erro";

export class ErroDiligencias extends Error {
  constructor(public readonly tipo: TipoErro) {
    super(tipo);
    this.name = "ErroDiligencias";
  }
}

export type CicloDiligencia = {
  id: string;
  id_competencia: string;
  id_organizacao: string;
  id_contrato: string;
  numero_rodada: number;
  status: StatusCiclo;
  recebido_em: string;
  prazo_resposta: string | null;
  encerrado_em: string | null;
  versao_registro: number;
};

export const CAMPOS_CICLO_DILIGENCIA =
  "id,id_competencia,id_organizacao,id_contrato,numero_rodada,status,recebido_em,prazo_resposta,encerrado_em,versao_registro";

export function registro(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function inteiro(value: unknown, minimo: number): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= minimo;
}

export function dataCalendario(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const data = new Date(value + "T00:00:00Z");
  return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === value;
}

export function instante(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    dataCalendario(value.slice(0, 10)) &&
    Number.isFinite(Date.parse(value))
  );
}

function statusCiclo(value: unknown): value is StatusCiclo {
  return typeof value === "string" && Object.hasOwn(ROTULOS_CICLO, value);
}

export function lerCiclo(
  value: unknown,
  competencia: string,
  organizacao: string,
  contrato: string,
): CicloDiligencia {
  if (!registro(value)) throw new ErroDiligencias("erro");
  const {
    id,
    id_competencia,
    id_organizacao,
    id_contrato,
    numero_rodada,
    status,
    recebido_em,
    prazo_resposta,
    encerrado_em,
    versao_registro,
  } = value;
  if (
    typeof id !== "string" ||
    !uuidValido(id) ||
    id_competencia !== competencia ||
    id_organizacao !== organizacao ||
    id_contrato !== contrato ||
    !inteiro(numero_rodada, 1) ||
    !inteiro(versao_registro, 1) ||
    !statusCiclo(status) ||
    !instante(recebido_em) ||
    (prazo_resposta !== null && !dataCalendario(prazo_resposta)) ||
    (encerrado_em !== null && !instante(encerrado_em))
  ) {
    throw new ErroDiligencias("erro");
  }
  return {
    id: uuidCanonico(id),
    id_competencia,
    id_organizacao,
    id_contrato,
    numero_rodada,
    status,
    recebido_em,
    prazo_resposta,
    encerrado_em,
    versao_registro,
  };
}

export function offsetDiligenciasValido(offset: number): boolean {
  return (
    inteiro(offset, 0) &&
    offset % PAGINA_DILIGENCIAS === 0 &&
    Number.isSafeInteger(offset + PAGINA_DILIGENCIAS - 1)
  );
}

export function erroLeituraDiligencia(status: number, codigo?: string): ErroDiligencias {
  const negado =
    status === 401 ||
    status === 403 ||
    (codigo !== undefined && ["42501", "PGRST301", "PGRST303"].includes(codigo));
  return new ErroDiligencias(negado ? "sem_permissao" : "erro");
}

export async function listarCiclosDiligencia(
  competencia: string,
  organizacao: string,
  contrato: string,
  offset: number,
  signal: AbortSignal,
): Promise<{ itens: CicloDiligencia[]; total: number }> {
  if (![competencia, organizacao, contrato].every(uuidValido) || !offsetDiligenciasValido(offset)) {
    throw new ErroDiligencias("invalido");
  }
  signal.throwIfAborted();
  const c = uuidCanonico(competencia);
  const o = uuidCanonico(organizacao);
  const co = uuidCanonico(contrato);
  try {
    const result = await supabase
      .from("ciclos_diligencia")
      .select(CAMPOS_CICLO_DILIGENCIA, { count: "exact" })
      .eq("id_competencia", c)
      .eq("id_organizacao", o)
      .eq("id_contrato", co)
      .order("numero_rodada", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + PAGINA_DILIGENCIAS - 1)
      .abortSignal(signal);
    signal.throwIfAborted();
    if (result.error) throw erroLeituraDiligencia(result.status, result.error.code);
    if (
      !Array.isArray(result.data) ||
      !inteiro(result.count, 0) ||
      result.data.length !== Math.min(PAGINA_DILIGENCIAS, Math.max(0, result.count - offset))
    ) {
      throw new ErroDiligencias("erro");
    }
    const itens = result.data.map((value) => lerCiclo(value, c, o, co));
    const ordemInvalida = itens.some((item, i) => {
      const anterior = itens[i - 1];
      return anterior !== undefined && anterior.numero_rodada <= item.numero_rodada;
    });
    if (new Set(itens.map((item) => item.id)).size !== itens.length || ordemInvalida) {
      throw new ErroDiligencias("erro");
    }
    return { itens, total: result.count };
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof ErroDiligencias) throw error;
    throw new ErroDiligencias("erro");
  }
}

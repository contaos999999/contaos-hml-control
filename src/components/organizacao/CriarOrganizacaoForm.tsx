import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  criarOrganizacao,
  dadosOrganizacaoValidos,
  ErroCriarOrganizacao,
  normalizarCnpj,
} from "@/lib/organizacao/criarOrganizacaoDados";

const mensagens = {
  invalido: "Informe a razão social e revise o CNPJ, quando preenchido.",
  negado:
    "Você não tem permissão ou sua sessão não está ativa. Entre novamente.",
  duplicado:
    "Já existe um registro com esses dados. Confira a lista de organizações.",
  incerto:
    "Não foi possível confirmar a criação. Confira a lista de organizações antes de tentar novamente.",
};
export function CriarOrganizacaoForm({
  onCriada,
  onCancelar,
}: {
  onCriada: (id: string) => void;
  onCancelar: () => void;
}) {
  const [razaoSocial, setRazao] = useState("");
  const [nomeFantasia, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<keyof typeof mensagens | null>(null);
  const ocupado = useRef(false);
  const montado = useRef(true);
  const razaoRef = useRef<HTMLInputElement>(null);
  const cnpjRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    montado.current = true;
    razaoRef.current?.focus();
    return () => {
      montado.current = false;
    };
  }, []);
  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (ocupado.current || erro === "incerto") return;
    const dados = { razaoSocial, nomeFantasia, cnpj };
    if (!dadosOrganizacaoValidos(dados)) {
      setErro("invalido");
      if (!razaoSocial.trim()) razaoRef.current?.focus();
      else if (normalizarCnpj(cnpj)) cnpjRef.current?.focus();
      return;
    }
    ocupado.current = true;
    setEnviando(true);
    setErro(null);
    try {
      const id = await criarOrganizacao(dados);
      if (montado.current) onCriada(id);
    } catch (e) {
      if (montado.current)
        setErro(e instanceof ErroCriarOrganizacao ? e.tipo : "incerto");
    } finally {
      ocupado.current = false;
      if (montado.current) setEnviando(false);
    }
  }
  return (
    <form
      noValidate
      aria-labelledby="org-criar-titulo"
      aria-busy={enviando}
      onSubmit={enviar}
      className="space-y-4 rounded-lg border border-border bg-card p-4"
    >
      <h2 id="org-criar-titulo" className="text-base font-semibold">
        Nova organização
      </h2>
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {mensagens[erro]}
        </p>
      )}
      <fieldset disabled={enviando} className="min-w-0 space-y-4">
        <legend className="sr-only">Dados da organização</legend>
        <div className="space-y-1.5">
          <Label htmlFor="org-criar-razao">Razão social</Label>
          <Input
            ref={razaoRef}
            id="org-criar-razao"
            value={razaoSocial}
            onChange={(e) => setRazao(e.target.value)}
            required
            maxLength={300}
            aria-invalid={
              (erro === "invalido" && !razaoSocial.trim()) || undefined
            }
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-criar-nome">Nome fantasia (opcional)</Label>
          <Input
            id="org-criar-nome"
            value={nomeFantasia}
            onChange={(e) => setNome(e.target.value)}
            maxLength={300}
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-criar-cnpj">CNPJ (opcional)</Label>
          <Input
            ref={cnpjRef}
            id="org-criar-cnpj"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            maxLength={18}
            aria-invalid={(erro === "invalido" && !!cnpj) || undefined}
            className="h-11"
          />
        </div>
      </fieldset>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="submit"
          className="h-11 flex-1"
          disabled={enviando || erro === "incerto"}
        >
          {enviando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />{" "}
              Criando…
            </>
          ) : (
            "Criar organização"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1"
          disabled={enviando}
          onClick={onCancelar}
        >
          Cancelar cadastro
        </Button>
      </div>
    </form>
  );
}

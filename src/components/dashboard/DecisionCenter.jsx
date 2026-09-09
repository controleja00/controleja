import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, ChevronRight, AlertCircle, ShoppingCart, Users, DollarSign, Clock, TrendingDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

const iconMap = { alert: AlertCircle, purchase: ShoppingCart, team: Users, finance: DollarSign, deadline: Clock, risk: TrendingDown };
const urgencyConfig = {
  urgente: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-500", label: "URGENTE" },
  importante: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-500", label: "IMPORTANTE" },
  atenção: { bg: "bg-secondary", border: "border-border", text: "text-primary", badge: "bg-secondary0", label: "ATENÇÃO" },
};

export default function DecisionCenter({ data }) {
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState(null);
  const [rawText, setRawText] = useState(null);

  const getDecisions = async () => {
    setLoading(true);
    const { projects, measurements, alerts, cashFlow, documents, subcontractors } = data;
    const summary = {
      obras_ativas: projects.filter(p => p.status === "Em andamento").length,
      obras_atrasadas: projects.filter(p => p.status === "Atrasada").map(p => p.name),
      medicoes_pendentes: measurements.filter(m => m.status === "Pendente").length,
      alertas_criticos: alerts.filter(a => a.severity === "Crítica").length,
      alertas_altos: alerts.filter(a => a.severity === "Alta").length,
      docs_vencidos: documents.filter(d => d.status === "Vencido").length,
      pagamentos_atrasados: cashFlow.filter(c => c.status === "Atrasado").map(c => ({ desc: c.description, valor: c.value })),
      saldo_caixa: cashFlow.filter(c => c.type === "Receita").reduce((s, c) => s + c.value, 0) - cashFlow.filter(c => c.type === "Despesa").reduce((s, c) => s + c.value, 0),
      empreiteiros_bloqueados: subcontractors.filter(s => s.status === "Bloqueado").length,
    };

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um gerente de obras sênior com 20 anos de experiência. Analise os dados abaixo e gere exatamente 4 ações prioritárias para o gestor fazer HOJE.

REGRAS:
- Fale como gerente experiente, não como robô
- Seja específico com números quando disponível
- Cada ação deve ter urgência: urgente, importante ou atenção
- Use linguagem da obra brasileira
- Se pagamentos atrasados existem, mencione valores específicos

Dados: ${JSON.stringify(summary)}

Responda em JSON com o formato:
{
  "acoes": [
    { "urgencia": "urgente|importante|atenção", "titulo": "título curto", "descricao": "explicação detalhada com impacto real" },
    ...
  ],
  "resumo_executivo": "1 frase resumindo a situação geral"
}`,
      response_json_schema: {
        type: "object",
        properties: {
          acoes: { type: "array", items: { type: "object", properties: { urgencia: { type: "string" }, titulo: { type: "string" }, descricao: { type: "string" } } } },
          resumo_executivo: { type: "string" }
        }
      }
    });

    if (res?.acoes) {
      setDecisions(res);
    } else {
      setRawText(typeof res === "string" ? res : JSON.stringify(res));
    }
    setLoading(false);
  };

  if (!decisions && !rawText) {
    return (
      <button
        onClick={getDecisions}
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg transition-all active:scale-98 disabled:opacity-70"
      >
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        </div>
        <div className="text-left flex-1">
          <p className="font-black text-sm">Central de Decisões</p>
          <p className="text-white/70 text-xs mt-0.5">{loading ? "Analisando sua operação..." : "O que fazer agora? Pergunte à IA"}</p>
        </div>
        {!loading && <ChevronRight className="h-5 w-5 text-white/50" />}
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-violet-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-black text-sm text-violet-900">Central de Decisões</p>
            {decisions?.resumo_executivo && <p className="text-[11px] text-violet-600 mt-0.5">{decisions.resumo_executivo}</p>}
          </div>
        </div>
        <button onClick={() => { setDecisions(null); setRawText(null); }} className="text-[11px] text-violet-600 font-semibold hover:underline">Atualizar</button>
      </div>

      {rawText && (
        <div className="p-4">
          <ReactMarkdown className="text-sm prose prose-sm max-w-none">{rawText}</ReactMarkdown>
        </div>
      )}

      {decisions?.acoes && (
        <div className="divide-y divide-border">
          {decisions.acoes.map((a, i) => {
            const uc = urgencyConfig[a.urgencia?.toLowerCase()] || urgencyConfig["atenção"];
            return (
              <div key={i} className={`flex gap-3 px-4 py-3 ${uc.bg}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full text-white ${uc.badge}`}>{uc.label}</span>
                    <p className={`text-sm font-bold ${uc.text}`}>{a.titulo}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.descricao}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Shield, Brain } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const riskColor = {
  "Baixo": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Médio": "text-amber-600 bg-amber-50 border-amber-200",
  "Alto": "text-orange-600 bg-orange-50 border-orange-200",
  "Crítico": "text-red-600 bg-red-50 border-red-200"
};

export default function ProjRisk({ project, subs, measurements, documents }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const expiredDocs = documents.filter(d => d.status === "Vencido").length;
  const lowScoreSubs = subs.filter(s => (s.score_total || 0) < 50).length;
  const pendingMeasurements = measurements.filter(m => m.status === "Pendente").length;

  const staticRisks = [
    { label: "Atraso", value: project.status === "Atrasada" ? 90 : project.status === "Em andamento" ? 30 : 15, fullMark: 100 },
    { label: "Financeiro", value: project.budget > 0 ? 25 : 60, fullMark: 100 },
    { label: "Jurídico", value: expiredDocs > 0 ? 70 : 20, fullMark: 100 },
    { label: "Trabalhista", value: lowScoreSubs > 0 ? 50 : 15, fullMark: 100 },
    { label: "Operacional", value: pendingMeasurements > 3 ? 60 : 20, fullMark: 100 },
    { label: "Documental", value: Math.min(100, expiredDocs * 25), fullMark: 100 },
  ];

  const runAIAnalysis = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em gestão de risco de obras de construção civil. Analise os dados abaixo e gere um relatório de risco completo.

Obra: ${project.name}
Status: ${project.status}
Progresso: ${project.progress_percent || 0}%
Orçamento: R$ ${project.budget || 0}
Início: ${project.start_date} | Prazo: ${project.expected_end_date}

Subempreiteiros: ${subs.map(s => `${s.company_name} (score: ${s.score_total || 0})`).join(", ")}
Documentos vencidos: ${expiredDocs}
Medições pendentes: ${pendingMeasurements}
Total de medições: ${measurements.length}

Gere:
1. Score geral da obra (0-100)
2. Probabilidade de atraso (%)
3. Probabilidade de estouro de custo (%)
4. Lista de riscos críticos identificados
5. Top 5 ações preventivas urgentes
6. Previsão realista de entrega`,
      response_json_schema: {
        type: "object",
        properties: {
          obra_score: { type: "number" },
          delay_probability: { type: "number" },
          cost_overrun_probability: { type: "number" },
          overall_risk: { type: "string" },
          critical_risks: { type: "array", items: { type: "object", properties: { risk: { type: "string" }, level: { type: "string" }, action: { type: "string" } } } },
          top_actions: { type: "array", items: { type: "string" } },
          delivery_forecast: { type: "string" },
          summary: { type: "string" }
        }
      }
    });
    setAnalysis(res);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Radar de Risco</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={staticRisks}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
              <Radar name="Risco" dataKey="value" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-sm">Indicadores de Risco</h3>
          {staticRisks.map(r => (
            <div key={r.label}>
              <div className="flex justify-between text-xs mb-1">
                <span>{r.label}</span>
                <span className={r.value >= 70 ? "text-red-600 font-bold" : r.value >= 40 ? "text-amber-600" : "text-emerald-600"}>{r.value}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${r.value >= 70 ? "bg-red-500" : r.value >= 40 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${r.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={runAIAnalysis} disabled={loading} className="w-full" size="lg">
        {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando riscos com IA...</> : <><Brain className="h-4 w-4 mr-2" />Gerar Análise de Risco Completa com IA</>}
      </Button>

      {analysis && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-3xl font-black ${analysis.obra_score >= 70 ? "text-emerald-600" : analysis.obra_score >= 50 ? "text-amber-600" : "text-red-600"}`}>{analysis.obra_score}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Score da Obra</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-orange-600">{analysis.delay_probability}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Prob. de Atraso</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-blue-600">{analysis.cost_overrun_probability}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Prob. Estouro</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold mb-2">Resumo da Análise</p>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            {analysis.delivery_forecast && <p className="text-xs text-primary font-medium mt-2">📅 Previsão de entrega: {analysis.delivery_forecast}</p>}
          </div>

          {analysis.critical_risks?.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border"><h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />Riscos Críticos</h3></div>
              <div className="divide-y divide-border">
                {analysis.critical_risks.map((r, i) => (
                  <div key={i} className="px-5 py-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{r.risk}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.action}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${riskColor[r.level] || "bg-gray-100 text-gray-700 border-gray-200"}`}>{r.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.top_actions?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Ações Preventivas Urgentes</h3>
              <ol className="space-y-2">
                {analysis.top_actions.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    {a}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
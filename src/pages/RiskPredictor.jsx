import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, Loader2, Shield, Zap } from "lucide-react";
import PageHeader from "../components/PageHeader";

export default function RiskPredictor() {
  const [projects, setProjects] = useState([]);
  const [subs, setSubs] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Project.list(),
      base44.entities.Subcontractor.list(),
      base44.entities.Measurement.list(),
    ]).then(([p, s, m]) => { setProjects(p); setSubs(s); setMeasurements(m); setDataLoading(false); });
  }, []);

  const analyze = async () => {
    setLoading(true);
    setPredictions(null);
    const summary = {
      projects: projects.map(p => ({ name: p.name, status: p.status, progress: p.progress_percent, start: p.start_date, end: p.expected_end_date })),
      subcontractors: subs.map(s => ({ name: s.company_name, score: s.score_total, specialty: s.specialty, status: s.status })),
      measurements: measurements.map(m => ({ project: m.project_name, sub: m.subcontractor_name, status: m.status, value: m.total_value }))
    };
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um sistema de IA preditiva para gestão de obras de construção civil. Analise os dados abaixo e gere previsões de risco.

Dados: ${JSON.stringify(summary)}

Analise e retorne:
1. Para cada obra: probabilidade de atraso (0-100%), nível de risco, motivos
2. Para cada subempreiteiro com score baixo: riscos específicos
3. Top 3 ações preventivas prioritárias
4. Score geral da carteira (0-100)
5. Principais alertas

Seja específico e use os dados fornecidos.`,
      response_json_schema: {
        type: "object",
        properties: {
          portfolio_score: { type: "number" },
          overall_risk: { type: "string" },
          project_risks: { type: "array", items: { type: "object", properties: { name: { type: "string" }, delay_probability: { type: "number" }, risk_level: { type: "string" }, reasons: { type: "array", items: { type: "string" } } } } },
          subcontractor_risks: { type: "array", items: { type: "object", properties: { name: { type: "string" }, risk: { type: "string" }, action: { type: "string" } } } },
          top_actions: { type: "array", items: { type: "string" } },
          alerts: { type: "array", items: { type: "string" } }
        }
      }
    });
    setPredictions(res);
    setLoading(false);
  };

  const riskColor = { "Baixo": "bg-emerald-50 text-emerald-700 border-emerald-200", "Médio": "bg-amber-50 text-amber-700 border-amber-200", "Alto": "bg-orange-50 text-orange-700 border-orange-200", "Crítico": "bg-red-50 text-red-700 border-red-200" };

  if (dataLoading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="IA Preditiva de Risco" subtitle="Inteligência artificial que prevê atrasos, riscos e problemas antes que aconteçam" />
      <div className="p-6 max-w-4xl space-y-6">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 flex items-start gap-4">
          <Zap className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <p className="font-semibold">Motor de Risco com IA</p>
            <p className="text-sm text-muted-foreground mt-1">Analisando {projects.length} obras e {subs.length} subempreiteiros com {measurements.length} medições históricas para gerar previsões precisas.</p>
          </div>
        </div>

        <Button onClick={analyze} disabled={loading} className="w-full" size="lg">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando riscos com IA...</> : <><Shield className="h-4 w-4 mr-2" />Gerar Análise de Risco</>}
        </Button>

        {predictions && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-4xl font-black text-primary">{predictions.portfolio_score || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Score da Carteira</p>
              </div>
              <div className={`border rounded-xl p-5 text-center ${riskColor[predictions.overall_risk] || "bg-card border-border"}`}>
                <p className="text-xl font-bold">{predictions.overall_risk}</p>
                <p className="text-sm mt-1 opacity-70">Risco Geral</p>
              </div>
            </div>

            {predictions.project_risks?.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4 text-amber-500" />Risco por Obra</h3>
                </div>
                <div className="divide-y divide-border">
                  {predictions.project_risks.map((p, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{p.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-600">{p.delay_probability}% atraso</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskColor[p.risk_level] || ""}`}>{p.risk_level}</span>
                        </div>
                      </div>
                      {p.reasons?.length > 0 && <ul className="space-y-0.5">{p.reasons.map((r, j) => <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5"><span className="text-amber-400">•</span>{r}</li>)}</ul>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {predictions.top_actions?.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-primary" />Ações Preventivas Prioritárias</h3>
                <ol className="space-y-2">
                  {predictions.top_actions.map((a, i) => (
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
    </div>
  );
}
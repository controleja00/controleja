import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, Loader2, CheckCircle2 } from "lucide-react";

const severityColor = {
  "Crítica": "border-l-red-500 bg-red-50/50",
  "Alta": "border-l-orange-500 bg-orange-50/50",
  "Média": "border-l-amber-500 bg-amber-50/50",
  "Baixa": "border-l-blue-500 bg-blue-50/50",
};

const severityBadge = {
  "Crítica": "bg-red-100 text-red-700",
  "Alta": "bg-orange-100 text-orange-700",
  "Média": "bg-amber-100 text-amber-700",
  "Baixa": "bg-blue-100 text-blue-700",
};

export default function ProjAlerts({ project, subs, measurements, documents }) {
  const [loading, setLoading] = useState(false);
  const [aiAlerts, setAiAlerts] = useState(null);

  const expiredDocs = documents.filter(d => d.status === "Vencido");
  const pendingMeasurements = measurements.filter(m => m.status === "Pendente");
  const lowScoreSubs = subs.filter(s => (s.score_total || 0) < 50);

  const staticAlerts = [
    ...expiredDocs.map(d => ({ title: `Documento vencido: ${d.type}`, desc: `Regularize o documento do subempreiteiro`, severity: "Alta" })),
    ...lowScoreSubs.map(s => ({ title: `Score baixo: ${s.company_name}`, desc: `Score ${s.score_total || 0}/100 — requer atenção`, severity: "Média" })),
    ...(pendingMeasurements.length > 0 ? [{ title: `${pendingMeasurements.length} medição(ões) pendente(s)`, desc: "Medições aguardando aprovação", severity: "Baixa" }] : []),
    ...(project.status === "Atrasada" ? [{ title: "Obra com status ATRASADA", desc: "Obra marcada como atrasada — revisar cronograma urgente", severity: "Crítica" }] : []),
  ];

  const generateAIAlerts = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Gere alertas inteligentes para a obra "${project.name}" com base nos dados:
Status: ${project.status} | Progresso: ${project.progress_percent || 0}%
Prazo: ${project.expected_end_date} | Hoje: ${new Date().toISOString().split("T")[0]}
Subempreiteiros: ${subs.map(s => `${s.company_name}(score:${s.score_total})`).join(",")}
Docs vencidos: ${documents.filter(d => d.status === "Vencido").length}
Medições pendentes: ${pendingMeasurements.length}
Orçamento: R$${project.budget || 0} | Executado: R$${measurements.filter(m => m.status === "Aprovada").reduce((s, m) => s + (m.total_value || 0), 0)}

Gere de 4 a 8 alertas inteligentes e acionáveis. Seja específico e prático.`,
      response_json_schema: {
        type: "object",
        properties: {
          alerts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                severity: { type: "string" },
                action: { type: "string" }
              }
            }
          }
        }
      }
    });
    setAiAlerts(res.alerts || []);
    setLoading(false);
  };

  const allAlerts = [...staticAlerts, ...(aiAlerts || [])];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Alertas da Obra ({allAlerts.length})</h3>
          <Button variant="outline" size="sm" onClick={generateAIAlerts} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3 mr-1" />}
            {loading ? "Gerando..." : "IA"}
          </Button>
        </div>
        {allAlerts.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-sm text-muted-foreground">Nenhum alerta ativo</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {allAlerts.map((a, i) => (
              <div key={i} className={`px-5 py-3 border-l-4 ${severityColor[a.severity] || "border-l-gray-300"}`}>
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <p className="text-sm font-medium">{a.title}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${severityBadge[a.severity] || "bg-gray-100 text-gray-600"}`}>{a.severity}</span>
                </div>
                <p className="text-xs text-muted-foreground">{a.desc || a.description}</p>
                {a.action && <p className="text-xs text-primary font-medium mt-1">→ {a.action}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
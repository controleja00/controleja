import { Link } from "react-router-dom";
import ScoreBadge from "../ScoreBadge";
import { AlertTriangle, ChevronRight, FileText, CheckCircle2 } from "lucide-react";

export default function ProjSubs({ subs, measurements, documents }) {
  if (subs.length === 0) return (
    <div className="bg-card border border-border rounded-xl flex items-center justify-center py-16">
      <p className="text-sm text-muted-foreground">Nenhum empreiteiro vinculado a esta obra</p>
    </div>
  );

  const ranked = [...subs].sort((a, b) => (b.score_total || 0) - (a.score_total || 0));

  return (
    <div className="space-y-3">
      {ranked.map((sub, i) => {
        const subMeasurements = measurements.filter(m => m.subcontractor_id === sub.id);
        const pending = subMeasurements.filter(m => m.status === "Pendente").length;
        const approved = subMeasurements.filter(m => m.status === "Aprovada");
        const totalExecuted = approved.reduce((s, m) => s + (m.total_value || 0), 0);
        const subDocs = documents.filter(d => d.subcontractor_id === sub.id);
        const expiredDocs = subDocs.filter(d => d.status === "Vencido").length;
        const hasRisk = (sub.score_total || 0) < 50 || expiredDocs > 0;

        return (
          <div key={sub.id} className={`bg-card border rounded-xl p-5 ${hasRisk ? "border-red-200" : "border-border"}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ScoreBadge score={sub.score_total} size="md" />
                  <span className="absolute -top-1 -left-1 text-xs font-bold text-muted-foreground">#{i + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{sub.company_name}</p>
                    {hasRisk && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{sub.specialty} · {sub.availability}</p>
                </div>
              </div>
              <Link to={`/subcontractors/${sub.id}`} className="text-primary shrink-0">
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { label: "Operacional", value: sub.score_operational || 0 },
                { label: "Técnico", value: sub.score_technical || 0 },
                { label: "Jurídico", value: sub.score_legal || 0 },
                { label: "Financeiro", value: sub.score_financial || 0 },
              ].map(sc => (
                <div key={sc.label} className="bg-muted/50 rounded-lg p-2 text-center">
                  <p className={`text-sm font-bold ${sc.value >= 70 ? "text-emerald-600" : sc.value >= 40 ? "text-amber-600" : "text-red-600"}`}>{sc.value}</p>
                  <p className="text-[9px] text-muted-foreground">{sc.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full ${pending > 0 ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                <FileText className="inline h-3 w-3 mr-1" />{pending} medição(ões) pendente(s)
              </span>
              <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                R$ {totalExecuted.toLocaleString("pt-BR")} executado
              </span>
              {expiredDocs > 0 && (
                <span className="px-2 py-1 rounded-full bg-red-50 text-red-700">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />{expiredDocs} doc(s) vencido(s)
                </span>
              )}
              {expiredDocs === 0 && <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 className="inline h-3 w-3 mr-1" />Docs OK</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
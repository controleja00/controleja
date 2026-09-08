import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { History, Loader2, TrendingUp, TrendingDown } from "lucide-react";

export default function ProgressHistory({ projectId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ProgressHistory.filter({ project_id: projectId }, "-created_date", 20)
      .then(d => { setHistory(d); setLoading(false); });
  }, [projectId]);

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );

  if (history.length === 0) return (
    <div className="bg-card border border-border rounded-2xl p-6 text-center">
      <History className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Nenhuma atualização de progresso registrada ainda.</p>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-bold">Histórico de Progresso</p>
      </div>
      <div className="divide-y divide-border">
        {history.map(h => {
          const up = h.new_percent >= h.previous_percent;
          const date = h.created_date ? new Date(h.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
          return (
            <div key={h.id} className="px-4 py-3 flex items-start gap-3">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${up ? "bg-emerald-100" : "bg-red-100"}`}>
                {up ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-red-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {h.previous_percent ?? 0}% → {h.new_percent}%
                  <span className={`ml-2 text-xs font-bold ${up ? "text-emerald-600" : "text-red-600"}`}>
                    {up ? "+" : ""}{h.new_percent - (h.previous_percent ?? 0)}%
                  </span>
                </p>
                {h.observation && <p className="text-xs text-muted-foreground mt-0.5 italic">"{h.observation}"</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{date}</span>
                  {h.responsible && <span className="text-[10px] text-muted-foreground">· {h.responsible}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
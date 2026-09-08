import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import PageHeader from "../components/PageHeader";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => base44.auth.me().then(me => base44.entities.Alert.filter({ created_by_id: me.id }, "-created_date").then(d => { setAlerts(d); setLoading(false); }));
  useEffect(() => { load(); }, []);

  const resolve = async (id) => {
    await base44.entities.Alert.update(id, { is_resolved: true });
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const severityColor = { "Crítica": "border-l-red-500 bg-red-50/50", "Alta": "border-l-orange-500 bg-orange-50/50", "Média": "border-l-amber-500 bg-amber-50/50", "Baixa": "border-l-blue-500 bg-blue-50/50" };
  const active = alerts.filter(a => !a.is_resolved);
  const resolved = alerts.filter(a => a.is_resolved);

  return (
    <div>
      <PageHeader title="Alertas" subtitle={`${active.length} ativos`} />
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          {active.length === 0 && <div className="bg-card border border-border rounded-xl p-8 text-center"><CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Nenhum alerta ativo</p></div>}
          {active.map(a => (
            <div key={a.id} className={`border-l-4 rounded-xl p-4 flex items-start gap-4 ${severityColor[a.severity] || "border-l-gray-300 bg-card"}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{a.severity}</span>
                  <span className="text-[10px] text-muted-foreground">· {a.type}</span>
                </div>
                <p className="text-sm font-semibold">{a.title}</p>
                {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
              </div>
              <Button size="sm" variant="outline" onClick={() => resolve(a.id)}>Resolver</Button>
            </div>
          ))}
        </div>
        {resolved.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Resolvidos ({resolved.length})</h3>
            <div className="space-y-2">
              {resolved.slice(0, 10).map(a => (
                <div key={a.id} className="bg-card border border-border rounded-lg p-3 opacity-60">
                  <p className="text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
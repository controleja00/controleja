import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import PageHeader from "../components/PageHeader";

const palette = {
  ink: "#172441",
  navy: "#1f3258",
  steel: "#8096bc",
  soft: "#e7ebf4",
  panel: "#ffffff",
  canvas: "#f6f8fc",
  line: "#e1e5ed",
  text: "#424c62",
  muted: "#778096",
  silver: "#b9bdc8",
};

const severityStyle = {
  Crítica: { bg: "#fff1f2", border: "#e11d48", text: "#9f1239", label: "Crítica" },
  Alta: { bg: "#fef2f2", border: "#dc2626", text: "#991b1b", label: "Alta" },
  Média: { bg: "#fff7ed", border: "#d97706", text: "#92400e", label: "Média" },
  Baixa: { bg: palette.soft, border: palette.steel, text: palette.navy, label: "Baixa" },
};

function Loading() {
  return (
    <div className="flex h-96 items-center justify-center" style={{ background: palette.canvas }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: palette.line, borderTopColor: palette.navy }} />
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: tone, borderColor: "rgba(23,36,65,0.08)" }}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
        <Icon className="h-5 w-5" style={{ color: palette.navy }} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.muted }}>{label}</p>
      <p className="mt-1 text-3xl font-black" style={{ color: palette.ink }}>{value}</p>
    </div>
  );
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => base44.auth.me().then((me) => (
    base44.entities.Alert.filter({ created_by_id: me.id }, "-created_date")
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
  ));

  useEffect(() => { load(); }, []);

  const resolve = async (id) => {
    await base44.entities.Alert.update(id, { is_resolved: true });
    load();
  };

  if (loading) return <Loading />;

  const active = alerts.filter((a) => !a.is_resolved);
  const resolved = alerts.filter((a) => a.is_resolved);
  const critical = active.filter((a) => a.severity === "Crítica" || a.severity === "Alta");
  const today = active.filter((a) => {
    if (!a.created_date) return false;
    return new Date(a.created_date).toDateString() === new Date().toDateString();
  });

  return (
    <div className="min-h-screen" style={{ background: palette.canvas }}>
      <PageHeader title="Alertas" subtitle="Pendências, riscos e avisos importantes das suas obras." />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="Ativos" value={active.length} icon={AlertTriangle} tone={palette.soft} />
          <SummaryCard label="Críticos" value={critical.length} icon={Clock3} tone="#d6ddea" />
          <SummaryCard label="Hoje" value={today.length} icon={AlertTriangle} tone="#eef2f8" />
          <SummaryCard label="Resolvidos" value={resolved.length} icon={ShieldCheck} tone="#f1f3f7" />
        </div>

        <section className="rounded-2xl border bg-white" style={{ borderColor: palette.line }}>
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Fila de decisão</p>
              <h2 className="text-xl font-black" style={{ color: palette.ink }}>Alertas ativos</h2>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: palette.soft, color: palette.navy }}>
              {active.length} aberto{active.length === 1 ? "" : "s"}
            </span>
          </div>

          {active.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: palette.soft }}>
                <CheckCircle2 className="h-7 w-7" style={{ color: palette.navy }} />
              </div>
              <p className="font-black" style={{ color: palette.ink }}>Nenhum alerta ativo</p>
              <p className="mt-1 text-sm" style={{ color: palette.muted }}>Quando surgir risco de prazo, documento ou financeiro, ele aparece aqui.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: palette.line }}>
              {active.map((alert) => {
                const style = severityStyle[alert.severity] || severityStyle.Baixa;
                return (
                  <article key={alert.id} className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: style.bg }}>
                      <AlertTriangle className="h-5 w-5" style={{ color: style.text }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: style.border, color: style.text }}>
                          {style.label}
                        </span>
                        {alert.type && <span className="text-[11px] font-semibold" style={{ color: palette.muted }}>{alert.type}</span>}
                      </div>
                      <p className="text-sm font-black" style={{ color: palette.ink }}>{alert.title}</p>
                      {alert.description && <p className="mt-1 text-sm leading-relaxed" style={{ color: palette.text }}>{alert.description}</p>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => resolve(alert.id)} className="shrink-0">
                      Resolver
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {resolved.length > 0 && (
          <section className="rounded-2xl border bg-white p-4" style={{ borderColor: palette.line }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Histórico</p>
            <h2 className="mt-1 text-lg font-black" style={{ color: palette.ink }}>Resolvidos recentemente</h2>
            <div className="mt-4 grid gap-2">
              {resolved.slice(0, 10).map((alert) => (
                <div key={alert.id} className="rounded-xl border px-3 py-3" style={{ borderColor: palette.line, background: "#f9fafc" }}>
                  <p className="text-sm font-semibold" style={{ color: palette.text }}>{alert.title}</p>
                  <p className="text-xs" style={{ color: palette.muted }}>{alert.type || "Alerta resolvido"}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

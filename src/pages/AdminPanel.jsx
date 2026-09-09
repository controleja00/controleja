import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { Users, Building2, DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Ruler } from "lucide-react";

const PLAN_PRICES = { starter: 497, professional: 997 };

export default function AdminPanel() {
  const { data: projects = [] } = useQuery({ queryKey: ["admin_projects"], queryFn: () => base44.entities.Project.list() });
  const { data: subs = [] } = useQuery({ queryKey: ["admin_subs"], queryFn: () => base44.entities.Subcontractor.list() });
  const { data: measurements = [] } = useQuery({ queryKey: ["admin_meas"], queryFn: () => base44.entities.Measurement.list() });
  const { data: docs = [] } = useQuery({ queryKey: ["admin_docs"], queryFn: () => base44.entities.Document.list() });
  const { data: alerts = [] } = useQuery({ queryKey: ["admin_alerts"], queryFn: () => base44.entities.Alert.list() });
  const { data: cashflow = [] } = useQuery({ queryKey: ["admin_cf"], queryFn: () => base44.entities.CashFlowEntry.list() });

  const totalRevenue = cashflow.filter(c => c.type === "Receita" && c.status === "Pago").reduce((a, c) => a + (c.value || 0), 0);
  const totalExpenses = cashflow.filter(c => c.type === "Despesa" && c.status === "Pago").reduce((a, c) => a + (c.value || 0), 0);
  const pendingMeasurements = measurements.filter(m => m.status === "Pendente");
  const expiredDocs = docs.filter(d => d.status === "Vencido");
  const activeProjects = projects.filter(p => p.status === "Em andamento");
  const blockedSubs = subs.filter(s => s.status === "Bloqueado");
  const unreadAlerts = alerts.filter(a => !a.is_read && !a.is_resolved);

  const metrics = [
    { label: "Total de Obras", value: projects.length, sub: `${activeProjects.length} em andamento`, icon: Building2, color: "text-primary", bg: "bg-secondary" },
    { label: "Subempreiteiros", value: subs.length, sub: `${blockedSubs.length} bloqueados`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Medições", value: measurements.length, sub: `${pendingMeasurements.length} pendentes`, icon: Ruler, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Receita Realizada", value: `R$ ${(totalRevenue / 1000).toFixed(0)}k`, sub: `Despesas: R$ ${(totalExpenses / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Alertas Ativos", value: unreadAlerts.length, sub: "Não resolvidos", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Docs Vencidos", value: expiredDocs.length, sub: "Requer atenção", icon: CheckCircle2, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const projectHealth = projects.map(p => {
    const projMeas = measurements.filter(m => m.project_id === p.id);
    const approved = projMeas.filter(m => m.status === "Aprovada").length;
    const pending = projMeas.filter(m => m.status === "Pendente").length;
    return { ...p, approved, pending, totalMeas: projMeas.length };
  });

  const subRanking = [...subs].sort((a, b) => (b.score_total || 0) - (a.score_total || 0)).slice(0, 10);

  return (
    <div>
      <PageHeader title="Painel Administrativo" subtitle="Visão geral da plataforma Consuobra — dados consolidados de todas as empresas" />
      <div className="p-4 sm:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="bg-card border border-border rounded-xl p-4">
              <div className={`h-8 w-8 rounded-lg ${m.bg} flex items-center justify-center mb-3`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{m.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Projects Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-sm">Obras Cadastradas</h2>
              <span className="text-xs text-muted-foreground">{projects.length} total</span>
            </div>
            <div className="divide-y divide-border">
              {projectHealth.slice(0, 8).map(p => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.client} · {p.address}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{p.progress_percent || 0}%</p>
                      <p className="text-[10px] text-muted-foreground">{p.totalMeas} medições</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === "Em andamento" ? "bg-secondary text-primary" : p.status === "Concluída" ? "bg-emerald-50 text-emerald-700" : p.status === "Atrasada" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && <p className="px-5 py-8 text-sm text-muted-foreground text-center">Nenhuma obra cadastrada</p>}
            </div>
          </div>

          {/* Top Subcontractors */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-sm">Top Subempreiteiros por Score</h2>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="divide-y divide-border">
              {subRanking.map((s, i) => (
                <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                  <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"}`}>#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.company_name}</p>
                    <p className="text-xs text-muted-foreground">{s.specialty} · {s.city}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${(s.score_total || 0) >= 70 ? "text-emerald-600" : (s.score_total || 0) >= 50 ? "text-amber-600" : "text-red-600"}`}>{s.score_total || 0}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.status === "Ativo" ? "bg-emerald-50 text-emerald-700" : s.status === "Bloqueado" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}>{s.status}</span>
                  </div>
                </div>
              ))}
              {subs.length === 0 && <p className="px-5 py-8 text-sm text-muted-foreground text-center">Nenhum subempreiteiro cadastrado</p>}
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm">Alertas Recentes do Sistema</h2>
            <span className="text-xs text-muted-foreground">{unreadAlerts.length} não resolvidos</span>
          </div>
          {unreadAlerts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground text-center">Nenhum alerta ativo</p>
          ) : (
            <div className="divide-y divide-border">
              {unreadAlerts.slice(0, 8).map(a => (
                <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${a.severity === "Crítica" ? "text-red-500" : a.severity === "Alta" ? "text-orange-500" : "text-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${a.severity === "Crítica" ? "bg-red-50 text-red-700" : a.severity === "Alta" ? "bg-orange-50 text-orange-700" : "bg-amber-50 text-amber-700"}`}>{a.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

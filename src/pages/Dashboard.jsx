import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Building2, AlertTriangle, CheckCircle2, Clock, DollarSign, FileText,
  Plus, ArrowRight, Bell, Camera, BarChart3, ChevronRight, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const fmt = (v) => {
  if (!v && v !== 0) return "R$ 0";
  const abs = Math.abs(v);
  if (abs >= 1000000) return `R$ ${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `R$ ${(abs / 1000).toFixed(0)}k`;
  return `R$ ${abs.toLocaleString("pt-BR")}`;
};

const statusConfig = {
  "Planejamento": { label: "Planejamento", bg: "bg-gray-100", text: "text-gray-600" },
  "Em andamento": { label: "Em andamento", bg: "bg-blue-50", text: "text-blue-600" },
  "Atrasada": { label: "Atrasada", bg: "bg-red-50", text: "text-red-600" },
  "Concluída": { label: "Concluída", bg: "bg-emerald-50", text: "text-emerald-600" },
  "Paralisada": { label: "Paralisada", bg: "bg-amber-50", text: "text-amber-600" },
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().catch(() => null).then(me => {
      if (!me) { setLoading(false); return; }
      setUser(me);
      Promise.all([
        base44.entities.Project.filter({ created_by_id: me.id }),
        base44.entities.Alert.filter({ is_resolved: false, created_by_id: me.id }),
        base44.entities.Document.filter({ created_by_id: me.id }),
        base44.entities.CashFlowEntry.filter({ created_by_id: me.id }, "-due_date", 100),
      ]).then(([p, a, d, c]) => {
        setProjects(p.filter(proj => proj.status !== "Arquivada"));
        setAlerts(a);
        setDocuments(d);
        setCashFlow(c);
        setLoading(false);
      });
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-1">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Carregando suas obras...</p>
      </div>
    </div>
  );

  const activeProjects = projects.filter(p => p.status === "Em andamento");
  const delayedProjects = projects.filter(p => p.status === "Atrasada" || p.status === "Paralisada");
  const criticalAlerts = alerts.filter(a => a.severity === "Crítica" || a.severity === "Alta");
  const pendingDocs = documents.filter(d => d.status === "Pendente" || d.status === "Vencido");

  // Gastos do mês
  const now = new Date();
  const monthExpenses = cashFlow
    .filter(c => c.type === "Despesa" && c.created_date) 
    .filter(c => {
      const d = new Date(c.created_date || c.due_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, c) => s + (c.value || 0), 0);

  const firstName = user?.full_name?.split(" ")[0] || "Construtor";

  if (projects.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Header saudação */}
      <div className="px-4 pt-5 pb-6" style={{ background: "#004038" }}>
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">{getGreeting()},</p>
        <h1 className="text-white text-2xl font-black">{firstName} 👷</h1>
        <p className="text-blue-300 text-xs mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/projects" className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-gray-500 font-medium">Obras ativas</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{activeProjects.length}</p>
            {delayedProjects.length > 0 && (
              <p className="text-xs text-red-500 font-semibold mt-0.5">{delayedProjects.length} atrasada{delayedProjects.length > 1 ? "s" : ""}</p>
            )}
          </Link>

          <Link to="/cash-flow" className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-gray-500 font-medium">Gastos do mês</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{fmt(monthExpenses)}</p>
            <p className="text-xs text-gray-400 mt-0.5">este mês</p>
          </Link>

          <Link to="/documents" className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-gray-500 font-medium">Docs pendentes</span>
            </div>
            <p className="text-2xl font-black text-gray-900">{pendingDocs.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">para revisar</p>
          </Link>

          <Link to="/alerts" className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-red-500" />
              <span className="text-xs text-gray-500 font-medium">Alertas</span>
            </div>
            <p className={`text-2xl font-black ${criticalAlerts.length > 0 ? "text-red-600" : "text-gray-900"}`}>
              {criticalAlerts.length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">importantes</p>
          </Link>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* Alertas críticos */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="font-bold text-red-700 text-sm">Atenção necessária</p>
              <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {criticalAlerts.length}
              </span>
            </div>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">{a.title}</p>
                    {a.description && <p className="text-xs text-red-500">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
            {criticalAlerts.length > 3 && (
              <Link to="/alerts" className="text-xs text-red-600 font-semibold mt-2 inline-flex items-center gap-1">
                Ver todos os alertas <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}

        {/* Lista de obras */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h2 className="font-bold text-sm text-gray-900">Suas Obras</h2>
            </div>
            <Link to="/projects" className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {projects.slice(0, 5).map((p) => {
              const sc = statusConfig[p.status] || statusConfig["Em andamento"];
              const projAlerts = alerts.filter(a => a.related_id === p.id);
              const spent = cashFlow.filter(c => c.project_id === p.id && c.type === "Despesa").reduce((s, c) => s + (c.value || 0), 0);
              return (
                <Link key={p.id} to={`/projects/${p.id}/central`} className="block hover:bg-gray-50 transition-colors">
                  <div className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate">{p.client || p.address || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {projAlerts.length > 0 && (
                          <div className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                            {projAlerts.length}
                          </div>
                        )}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${p.status === "Concluída" ? "bg-emerald-500" : p.status === "Atrasada" ? "bg-red-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(100, p.progress_percent || 0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 font-semibold">{p.progress_percent || 0}%</span>
                    </div>
                    {/* Budget info */}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {p.budget > 0 && (
                        <span>Orçamento: <strong className="text-gray-600">{fmt(p.budget)}</strong></span>
                      )}
                      {spent > 0 && (
                        <span>Gasto: <strong className={spent > (p.budget || 0) && p.budget > 0 ? "text-red-600" : "text-gray-600"}>{fmt(spent)}</strong></span>
                      )}
                      {p.expected_end_date && (
                        <span>Prazo: <strong className="text-gray-600">{new Date(p.expected_end_date).toLocaleDateString("pt-BR")}</strong></span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link
            to="/projects/new"
            className="flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Nova Obra</span>
          </Link>
        </div>

        {/* Ações rápidas */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/projects/new", icon: Building2, label: "Nova Obra", color: "bg-blue-600", sub: "Cadastrar projeto" },
              { to: "/cash-flow", icon: DollarSign, label: "Registrar Gasto", color: "bg-emerald-600", sub: "Lançar despesa" },
              { to: "/documents", icon: FileText, label: "Documentos", color: "bg-violet-600", sub: "Enviar arquivo" },
              { to: "/alerts", icon: Bell, label: "Ver Alertas", color: "bg-red-600", sub: "Pendências" },
            ].map((q) => (
              <Link key={q.to} to={q.to} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all flex flex-col gap-2">
                <div className={`h-9 w-9 rounded-xl ${q.color} flex items-center justify-center`}>
                  <q.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{q.label}</p>
                  <p className="text-xs text-gray-400">{q.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <div className="px-4 pt-5 pb-8" style={{ background: "#004038" }}>
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">Bem-vindo!</p>
        <h1 className="text-white text-2xl font-black">Consuobra</h1>
        <p className="text-blue-300 text-sm mt-1">Seu painel de controle de obras · Obra sob controle</p>
      </div>
      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Cadastre sua primeira obra</h2>
          <p className="text-gray-500 text-sm mb-5 max-w-xs mx-auto">
            Comece organizando seu primeiro projeto. Leva menos de 2 minutos.
          </p>
          <Link to="/projects/new">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Cadastrar primeira obra
            </Button>
          </Link>
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">O que você pode fazer</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: "/cash-flow", icon: DollarSign, label: "Controlar Gastos", desc: "Registre despesas e compare com o orçamento", color: "text-emerald-600", bg: "bg-emerald-50" },
            { to: "/documents", icon: FileText, label: "Organizar Documentos", desc: "Contratos, notas fiscais e certidões", color: "text-violet-600", bg: "bg-violet-50" },
            { to: "/measurements", icon: BarChart3, label: "Registrar Avanço", desc: "Medições e etapas concluídas", color: "text-blue-600", bg: "bg-blue-50" },
            { to: "/alerts", icon: Bell, label: "Ver Alertas", desc: "Pendências e vencimentos", color: "text-red-600", bg: "bg-red-50" },
          ].map((a) => (
            <Link key={a.to} to={a.to} className={`${a.bg} rounded-2xl p-4 hover:opacity-80 transition-opacity`}>
              <a.icon className={`h-5 w-5 ${a.color} mb-2`} />
              <p className={`text-sm font-bold ${a.color}`}>{a.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
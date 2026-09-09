import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Building2,
  AlertTriangle,
  DollarSign,
  FileText,
  Plus,
  ArrowRight,
  Bell,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandLogo";

const colors = {
  ink: "#0f161e",
  teal: "#004038",
  graphite: "#3d3e45",
  muted: "#6f7073",
  line: "#efefef",
  canvas: "#fbfaf8",
  lavender: "#e5d3f7",
  peach: "#fef1e1",
  butter: "#fde8ce",
  sky: "#bee9f4",
  periwinkle: "#c6c4f4",
};

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
  Planejamento: { label: "Planejamento", bg: colors.peach, text: colors.ink, bar: colors.butter },
  "Em andamento": { label: "Em andamento", bg: colors.sky, text: colors.teal, bar: colors.teal },
  Atrasada: { label: "Atrasada", bg: "#fee2e2", text: "#b91c1c", bar: "#dc2626" },
  Concluída: { label: "Concluída", bg: "#dcfce7", text: "#166534", bar: "#16a34a" },
  Paralisada: { label: "Paralisada", bg: colors.butter, text: "#92400e", bar: "#d97706" },
};

function LoadingState() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" style={{ background: colors.canvas }}>
      <div className="flex flex-col items-center gap-3 text-center">
        <BrandMark className="h-14 w-14 rounded-2xl" />
        <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: colors.line, borderTopColor: colors.teal }} />
        <p className="text-sm font-semibold" style={{ color: colors.muted }}>Carregando o painel da obra...</p>
      </div>
    </div>
  );
}

function KpiCard({ to, icon: Icon, label, value, note, tone }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border p-4 transition-colors hover:border-[#004038]"
      style={{ background: tone, borderColor: "rgba(15,22,30,0.08)" }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.72)" }}>
          <Icon className="h-4 w-4" style={{ color: colors.teal }} />
        </div>
        <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: colors.teal }} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>{label}</p>
      <p className="mt-1 text-3xl font-black tracking-tight" style={{ color: colors.ink }}>{value}</p>
      <p className="mt-1 text-xs font-medium" style={{ color: colors.graphite }}>{note}</p>
    </Link>
  );
}

function ProjectRow({ project, alerts, cashFlow }) {
  const sc = statusConfig[project.status] || statusConfig["Em andamento"];
  const projectAlerts = alerts.filter((a) => a.related_id === project.id);
  const spent = cashFlow
    .filter((c) => c.project_id === project.id && c.type === "Despesa")
    .reduce((s, c) => s + (c.value || 0), 0);
  const progress = Math.min(100, project.progress_percent || 0);

  return (
    <Link to={`/projects/${project.id}/central`} className="block border-t transition-colors hover:bg-[#fbfaf8]" style={{ borderColor: colors.line }}>
      <div className="px-4 py-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black" style={{ color: colors.ink }}>{project.name}</p>
            <p className="mt-0.5 truncate text-xs" style={{ color: colors.muted }}>{project.client || project.address || "Cliente ou endereço ainda não informado"}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {projectAlerts.length > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-black text-white" style={{ background: "#dc2626" }}>
                {projectAlerts.length}
              </span>
            )}
            <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: sc.bg, color: sc.text }}>
              {sc.label}
            </span>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: colors.line }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: sc.bar }} />
          </div>
          <span className="text-xs font-black" style={{ color: colors.teal }}>{progress}%</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <span style={{ color: colors.muted }}>Orçamento <strong style={{ color: colors.graphite }}>{project.budget > 0 ? fmt(project.budget) : "não informado"}</strong></span>
          <span style={{ color: colors.muted }}>Gasto <strong style={{ color: spent > (project.budget || 0) && project.budget > 0 ? "#dc2626" : colors.graphite }}>{spent > 0 ? fmt(spent) : "R$ 0"}</strong></span>
          <span style={{ color: colors.muted }}>Prazo <strong style={{ color: colors.graphite }}>{project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString("pt-BR") : "sem data"}</strong></span>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().catch(() => null).then((me) => {
      if (!me) {
        setLoading(false);
        return;
      }
      setUser(me);
      Promise.all([
        base44.entities.Project.filter({ created_by_id: me.id }),
        base44.entities.Alert.filter({ is_resolved: false, created_by_id: me.id }),
        base44.entities.Document.filter({ created_by_id: me.id }),
        base44.entities.CashFlowEntry.filter({ created_by_id: me.id }, "-due_date", 100),
      ]).then(([p, a, d, c]) => {
        setProjects(p.filter((proj) => proj.status !== "Arquivada"));
        setAlerts(a);
        setDocuments(d);
        setCashFlow(c);
        setLoading(false);
      });
    });
  }, []);

  if (loading) return <LoadingState />;

  const activeProjects = projects.filter((p) => p.status === "Em andamento");
  const delayedProjects = projects.filter((p) => p.status === "Atrasada" || p.status === "Paralisada");
  const criticalAlerts = alerts.filter((a) => a.severity === "Crítica" || a.severity === "Alta");
  const pendingDocs = documents.filter((d) => d.status === "Pendente" || d.status === "Vencido");
  const now = new Date();
  const monthExpenses = cashFlow
    .filter((c) => c.type === "Despesa" && c.created_date)
    .filter((c) => {
      const d = new Date(c.created_date || c.due_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, c) => s + (c.value || 0), 0);

  const firstName = user?.full_name?.split(" ")[0] || "Construtor";

  if (projects.length === 0) {
    return <EmptyState firstName={firstName} />;
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: colors.canvas }}>
      <section className="px-4 pb-7 pt-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border p-5 sm:p-7" style={{ background: colors.peach, borderColor: "rgba(15,22,30,0.08)" }}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>
                  {getGreeting()}, {firstName}
                </p>
                <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl" style={{ color: colors.ink }}>
                  O que precisa da sua atenção hoje?
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: colors.graphite }}>
                  Visão rápida das obras, caixa, documentos e pendências para você decidir sem abrir dez planilhas.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/projects/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova obra
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Relatório
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard to="/projects" icon={Building2} label="Obras em campo" value={activeProjects.length} note={`${delayedProjects.length} com atraso ou pausa`} tone={colors.lavender} />
          <KpiCard to="/cash-flow" icon={DollarSign} label="Gasto do mês" value={fmt(monthExpenses)} note="despesas registradas" tone={colors.butter} />
          <KpiCard to="/documents" icon={FileText} label="Documentos" value={pendingDocs.length} note="pendentes ou vencidos" tone={colors.sky} />
          <KpiCard to="/alerts" icon={Bell} label="Alertas críticos" value={criticalAlerts.length} note="pedem decisão rápida" tone={colors.periwinkle} />
        </div>
      </section>

      <section className="px-4 pt-5 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: colors.line }}>
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>Central de obras</p>
                <h2 className="text-xl font-black" style={{ color: colors.ink }}>Obras em acompanhamento</h2>
              </div>
              <Link to="/projects" className="inline-flex items-center gap-1 text-sm font-bold" style={{ color: colors.teal }}>
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {projects.slice(0, 5).map((project) => (
              <ProjectRow key={project.id} project={project} alerts={alerts} cashFlow={cashFlow} />
            ))}
            <Link to="/projects/new" className="flex items-center gap-2 border-t px-4 py-4 text-sm font-bold transition-colors hover:bg-[#fef1e1]" style={{ borderColor: colors.line, color: colors.teal }}>
              <Plus className="h-4 w-4" />
              Cadastrar nova obra
            </Link>
          </div>

          <div className="space-y-5">
            {criticalAlerts.length > 0 ? (
              <div className="rounded-2xl border p-5" style={{ background: "#fee2e2", borderColor: "#fecaca" }}>
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" style={{ color: "#b91c1c" }} />
                  <h2 className="font-black" style={{ color: "#7f1d1d" }}>Atenção necessária</h2>
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ background: "#dc2626" }}>{criticalAlerts.length}</span>
                </div>
                <div className="space-y-3">
                  {criticalAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id}>
                      <p className="text-sm font-bold" style={{ color: "#7f1d1d" }}>{alert.title}</p>
                      {alert.description && <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#991b1b" }}>{alert.description}</p>}
                    </div>
                  ))}
                </div>
                <Link to="/alerts" className="mt-4 inline-flex items-center gap-1 text-sm font-bold" style={{ color: "#b91c1c" }}>
                  Resolver alertas <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border p-5" style={{ background: colors.sky, borderColor: "rgba(15,22,30,0.08)" }}>
                <ClipboardCheck className="mb-3 h-6 w-6" style={{ color: colors.teal }} />
                <h2 className="font-black" style={{ color: colors.ink }}>Sem urgências críticas</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: colors.graphite }}>
                  Boa. Use esse espaço para revisar progresso, atualizar fotos e manter o financeiro em dia.
                </p>
              </div>
            )}

            <div className="rounded-2xl border bg-white p-5" style={{ borderColor: colors.line }}>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>Atalhos de campo</p>
              <div className="mt-4 grid gap-2">
                {[
                  { to: "/measurements/new", icon: BarChart3, label: "Registrar avanço", sub: "Medição ou etapa concluída" },
                  { to: "/cash-flow", icon: DollarSign, label: "Lançar gasto", sub: "Despesa, receita ou previsão" },
                  { to: "/documents", icon: FileText, label: "Enviar documento", sub: "Contrato, nota ou certidão" },
                  { to: "/autopilot", icon: TrendingUp, label: "Analisar rotina", sub: "Resumo inteligente das obras" },
                ].map((item) => (
                  <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#fbfaf8]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: colors.peach }}>
                      <item.icon className="h-4 w-4" style={{ color: colors.teal }} />
                    </div>
                    <div>
                      <p className="text-sm font-black" style={{ color: colors.ink }}>{item.label}</p>
                      <p className="text-xs" style={{ color: colors.muted }}>{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState({ firstName }) {
  return (
    <div className="min-h-screen pb-24" style={{ background: colors.canvas }}>
      <section className="px-4 pb-8 pt-6 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border p-6 sm:p-8" style={{ background: colors.peach, borderColor: "rgba(15,22,30,0.08)" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.muted }}>Bem-vindo, {firstName}</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl" style={{ color: colors.ink }}>
            Sua primeira obra merece um painel simples desde o primeiro dia.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: colors.graphite }}>
            Cadastre a obra, informe orçamento e prazo, depois acompanhe gastos, documentos, fotos e alertas no mesmo lugar.
          </p>
          <Link to="/projects/new" className="mt-6 inline-flex">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar primeira obra
            </Button>
          </Link>
        </div>
      </section>

      <section className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { to: "/cash-flow", icon: DollarSign, label: "Controle financeiro", desc: "Registre receitas, despesas e previsões sem perder o orçamento.", bg: colors.butter },
            { to: "/documents", icon: FileText, label: "Documentos da obra", desc: "Guarde contratos, notas e certidões conectados ao projeto.", bg: colors.sky },
            { to: "/measurements", icon: CalendarDays, label: "Avanço físico", desc: "Acompanhe etapas, progresso e histórico de medições.", bg: colors.lavender },
            { to: "/alerts", icon: Bell, label: "Alertas úteis", desc: "Receba pendências importantes antes de virarem problema.", bg: colors.periwinkle },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="rounded-2xl border p-5 transition-colors hover:border-[#004038]" style={{ background: item.bg, borderColor: "rgba(15,22,30,0.08)" }}>
              <item.icon className="mb-4 h-5 w-5" style={{ color: colors.teal }} />
              <p className="font-black" style={{ color: colors.ink }}>{item.label}</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: colors.graphite }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

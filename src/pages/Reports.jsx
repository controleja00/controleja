import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { consuobra } from "@/api/consuobraClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  DollarSign,
  FileText,
  Loader2,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import PageHeader from "../components/PageHeader";
import { formatBRLMoney } from "@/lib/money";

const REPORT_TYPES = [
  { id: "executivo", label: "Relatório Executivo", icon: TrendingUp, desc: "Resumo completo para tomada de decisão" },
  { id: "financeiro", label: "Relatório Financeiro", icon: DollarSign, desc: "Receita, gastos, saldo e risco de margem" },
  { id: "risco", label: "Relatório de Risco", icon: Shield, desc: "Prazo, documentos, equipe e pontos críticos" },
  { id: "produtividade", label: "Relatório de Produtividade", icon: BarChart3, desc: "Medições, avanço físico e execução" },
];

const palette = {
  ink: "#172441",
  navy: "#1f3258",
  muted: "#778096",
  text: "#424c62",
  line: "#e1e5ed",
  canvas: "#f6f8fc",
  soft: "#e7ebf4",
  pale: "#eff2f8",
};

const today = () => new Date().toISOString().split("T")[0];

function Loading() {
  return (
    <div className="flex h-96 items-center justify-center" style={{ background: palette.canvas }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: palette.line, borderTopColor: palette.navy }} />
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: tone, borderColor: "rgba(23,36,65,0.08)" }}>
      <Icon className="mb-3 h-5 w-5" style={{ color: palette.navy }} />
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.muted }}>{label}</p>
      <p className="mt-1 text-2xl font-black" style={{ color: palette.ink }}>{value}</p>
    </div>
  );
}

export default function Reports() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [subs, setSubs] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [cashflow, setCashflow] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("all");
  const [reportType, setReportType] = useState("executivo");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  useEffect(() => {
    consuobra.auth.me().then(me => Promise.all([
      consuobra.entities.Project.filter({ created_by_id: me.id }),
      consuobra.entities.Subcontractor.filter({ created_by_id: me.id }),
      consuobra.entities.Measurement.filter({ created_by_id: me.id }),
      consuobra.entities.Document.filter({ created_by_id: me.id }),
      consuobra.entities.CashFlowEntry.filter({ created_by_id: me.id }, "-due_date", 300),
      consuobra.entities.DailyReport.filter({ created_by_id: me.id }, "-report_date", 200),
    ]).then(([p, s, m, d, c, r]) => {
      setUser(me);
      setProjects(p.filter(project => project.status !== "Arquivada"));
      setSubs(s);
      setMeasurements(m);
      setDocuments(d);
      setCashflow(c);
      setDailyReports(r);
      setLoading(false);
    }).catch(() => {
      setError("Não foi possível carregar os dados para relatórios.");
      setLoading(false);
    }));
  }, []);

  const selectedProjectData = selectedProject === "all"
    ? null
    : projects.find(project => project.id === selectedProject);

  const selectedType = REPORT_TYPES.find(type => type.id === reportType) || REPORT_TYPES[0];

  const reportData = useMemo(() => {
    const subIds = selectedProjectData?.subcontractor_ids || [];
    const filtMeasurements = selectedProjectData
      ? measurements.filter(m => m.project_id === selectedProjectData.id)
      : measurements;
    const filtSubs = selectedProjectData
      ? subs.filter(s => subIds.includes(s.id))
      : subs;
    const filtDocs = selectedProjectData
      ? documents.filter(d => d.project_id === selectedProjectData.id || subIds.includes(d.subcontractor_id))
      : documents;
    const filtCashflow = selectedProjectData
      ? cashflow.filter(entry => entry.project_id === selectedProjectData.id)
      : cashflow;
    const filtDailyReports = selectedProjectData
      ? dailyReports.filter(item => item.project_id === selectedProjectData.id)
      : dailyReports;

    const approvedMeasurements = filtMeasurements.filter(m => m.status === "Aprovada");
    const pendingMeasurements = filtMeasurements.filter(m => m.status === "Pendente");
    const receitas = filtCashflow.filter(entry => entry.type === "Receita").reduce((sum, entry) => sum + (entry.value || 0), 0);
    const despesas = filtCashflow.filter(entry => entry.type === "Despesa").reduce((sum, entry) => sum + (entry.value || 0), 0);
    const expiredDocs = filtDocs.filter(d => d.status === "Vencido");
    const pendingDocs = filtDocs.filter(d => d.status === "Pendente");

    return {
      project: selectedProjectData ? {
        name: selectedProjectData.name,
        status: selectedProjectData.status,
        progress: selectedProjectData.progress_percent || 0,
        contractedValue: selectedProjectData.contracted_value || 0,
        budget: selectedProjectData.budget || 0,
        start: selectedProjectData.start_date,
        end: selectedProjectData.expected_end_date,
        type: selectedProjectData.project_type,
      } : "Todas as obras",
      measurements: {
        total: filtMeasurements.length,
        approved: approvedMeasurements.length,
        pending: pendingMeasurements.length,
        totalValue: approvedMeasurements.reduce((sum, item) => sum + (item.total_value || 0), 0),
      },
      cashflow: {
        totalEntries: filtCashflow.length,
        revenue: receitas,
        expense: despesas,
        balance: receitas - despesas,
        overdue: filtCashflow.filter(entry => entry.status === "Atrasado").length,
        open: filtCashflow.filter(entry => entry.status === "A pagar" || entry.status === "Atrasado").length,
      },
      subcontractors: filtSubs.map(s => ({
        name: s.company_name,
        score: s.score_total,
        specialty: s.specialty,
        status: s.status,
      })),
      documents: {
        total: filtDocs.length,
        expired: expiredDocs.length,
        pending: pendingDocs.length,
      },
      dailyReports: {
        total: filtDailyReports.length,
        published: filtDailyReports.filter(item => item.status === "Publicado" && item.visible_to_client !== false).length,
        drafts: filtDailyReports.filter(item => item.status === "Rascunho" || item.status === "Revisado").length,
        lastUpdate: filtDailyReports[0]?.report_date || null,
      },
    };
  }, [cashflow, dailyReports, documents, measurements, selectedProjectData, subs]);

  const generate = async () => {
    setGenerating(true);
    setReport(null);
    setSaved(false);
    setError("");

    const commonRules = `
Use português do Brasil.
Seja direto, profissional e útil para construtor pequeno, empreiteiro ou engenheiro.
Não invente números. Quando faltar dado, diga exatamente qual dado precisa ser preenchido.
Organize em Markdown com títulos curtos, bullets e próximos passos.
Inclua uma seção final chamada "Dados que faltam para melhorar este relatório".`;

    const prompts = {
      executivo: `Gere um relatório executivo da obra/plataforma com base nestes dados: ${JSON.stringify(reportData)}. Inclua situação geral, progresso, financeiro, documentos, riscos e próximas ações. ${commonRules}`,
      financeiro: `Gere um relatório financeiro com base nestes dados: ${JSON.stringify(reportData)}. Inclua receita contratada, custo previsto, medições aprovadas, caixa, saldo, risco de estouro e ações recomendadas. ${commonRules}`,
      risco: `Gere um relatório de risco com base nestes dados: ${JSON.stringify(reportData)}. Inclua risco de atraso, documento vencido, medição pendente, financeiro, equipe e ações preventivas. ${commonRules}`,
      produtividade: `Gere um relatório de produtividade com base nestes dados: ${JSON.stringify(reportData)}. Inclua avanço físico, medições, equipes, gargalos, ritmo de execução e recomendações. ${commonRules}`,
    };

    try {
      const res = await consuobra.integrations.Core.InvokeLLM({ prompt: prompts[reportType] });
      setReport({
        content: typeof res === "string" ? res : JSON.stringify(res, null, 2),
        type: reportType,
        projectId: selectedProjectData?.id || "",
        project: selectedProjectData?.name || "Todas as obras",
        date: new Date().toLocaleDateString("pt-BR"),
      });
    } catch {
      setError("Não foi possível gerar o relatório agora. Tente novamente em alguns instantes.");
    } finally {
      setGenerating(false);
    }
  };

  const saveToProjectHistory = async () => {
    if (!report?.projectId || !selectedProjectData) {
      setError("Escolha uma obra específica para salvar o relatório na Central da Obra.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await consuobra.entities.DailyReport.create({
        project_id: selectedProjectData.id,
        project_name: selectedProjectData.name,
        report_date: today(),
        phase: selectedType.label,
        observation: `Relatório ${selectedType.label.toLowerCase()} gerado pela área de Relatórios.`,
        visible_to_client: false,
        photos: [],
        ai_report: report.content,
        status: "Revisado",
        sent_by: user?.full_name || user?.email || "Gestor",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch {
      setError("Não foi possível salvar este relatório na Central da Obra.");
    } finally {
      setSaving(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    const el = document.createElement("a");
    el.href = "data:text/plain;charset=utf-8," + encodeURIComponent(report.content);
    el.download = `relatorio-${report.type}-${today()}.md`;
    el.click();
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen" style={{ background: palette.canvas }}>
      <PageHeader title="Relatórios" subtitle="Análises automáticas com base nos dados reais das suas obras." />

      <div className="max-w-5xl space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Obras ativas" value={projects.length} icon={FileText} tone={palette.soft} />
          <Stat label="Medições aprovadas" value={measurements.filter(m => m.status === "Aprovada").length} icon={CheckCircle2} tone="#d6ddea" />
          <Stat label="Docs vencidos" value={documents.filter(d => d.status === "Vencido").length} icon={AlertTriangle} tone="#f1f3f7" />
          <Stat label="Publicados" value={dailyReports.filter(r => r.status === "Publicado" && r.visible_to_client !== false).length} icon={Sparkles} tone={palette.pale} />
        </div>

        <section className="rounded-2xl border bg-white p-5" style={{ borderColor: palette.line }}>
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Tipo de análise</p>
            <h2 className="mt-1 text-xl font-black" style={{ color: palette.ink }}>Escolha o relatório que você precisa agora</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {REPORT_TYPES.map(rt => (
              <button key={rt.id} onClick={() => setReportType(rt.id)} className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${reportType === rt.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"}`}>
                <rt.icon className={`mt-0.5 h-5 w-5 shrink-0 ${reportType === rt.id ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className={`text-sm font-bold ${reportType === rt.id ? "text-primary" : "text-foreground"}`}>{rt.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{rt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-[1fr_1.1fr]" style={{ borderColor: palette.line }}>
          <div>
            <Label>Obra</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Todas as obras" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as obras</SelectItem>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs" style={{ color: palette.muted }}>
              Para salvar no histórico da Central, selecione uma obra específica.
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: palette.pale }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Base do relatório</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <p><strong>{reportData.measurements.total}</strong> medições</p>
              <p><strong>{reportData.documents.total}</strong> documentos</p>
              <p><strong>{formatBRLMoney(reportData.cashflow.balance)}</strong> saldo</p>
              <p><strong>{reportData.dailyReports.published}</strong> publicados</p>
            </div>
          </div>
        </section>

        <Button onClick={generate} disabled={generating || projects.length === 0} className="w-full gap-2" size="lg">
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" />Gerando relatório com IA...</> : <><FileText className="h-4 w-4" />Gerar {selectedType.label}</>}
        </Button>

        {projects.length === 0 && (
          <div className="rounded-2xl border bg-white p-5 text-center" style={{ borderColor: palette.line }}>
            <p className="font-bold" style={{ color: palette.ink }}>Cadastre uma obra para gerar relatórios reais</p>
            <p className="mt-1 text-sm" style={{ color: palette.text }}>O relatório precisa de uma obra, medições, documentos ou lançamentos para gerar valor.</p>
            <Link to="/projects/new"><Button className="mt-4">Cadastrar obra</Button></Link>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {saved && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />Relatório salvo como revisado na Central da Obra.
          </div>
        )}

        {report && (
          <section className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: palette.line }}>
            <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: palette.line, background: palette.pale }}>
              <div>
                <p className="text-sm font-bold" style={{ color: palette.ink }}>{selectedType.label}</p>
                <p className="text-xs" style={{ color: palette.muted }}>{report.project} · {report.date}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={exportReport}>
                  <Download className="mr-1.5 h-3 w-3" />Exportar MD
                </Button>
                {report.projectId && (
                  <Button variant="outline" size="sm" onClick={saveToProjectHistory} disabled={saving}>
                    {saving ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3 w-3" />}
                    Salvar na Central
                  </Button>
                )}
              </div>
            </div>
            <div className="p-6">
              <ReactMarkdown className="prose prose-sm max-w-none [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm">
                {report.content}
              </ReactMarkdown>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

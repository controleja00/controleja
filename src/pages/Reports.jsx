import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Download, TrendingUp, Shield, DollarSign, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PageHeader from "../components/PageHeader";

const REPORT_TYPES = [
  { id: "executivo", label: "Relatório Executivo", icon: TrendingUp, desc: "Visão geral completa da obra" },
  { id: "financeiro", label: "Relatório Financeiro", icon: DollarSign, desc: "Custos, pagamentos e fluxo de caixa" },
  { id: "risco", label: "Relatório de Risco", icon: Shield, desc: "Riscos identificados e ações preventivas" },
  { id: "produtividade", label: "Relatório de Produtividade", icon: BarChart3, desc: "Performance dos empreiteiros e equipes" },
];

export default function Reports() {
  const [projects, setProjects] = useState([]);
  const [subs, setSubs] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [reportType, setReportType] = useState("executivo");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    base44.auth.me().then(me => Promise.all([
      base44.entities.Project.filter({ created_by_id: me.id }),
      base44.entities.Subcontractor.filter({ created_by_id: me.id }),
      base44.entities.Measurement.filter({ created_by_id: me.id }),
      base44.entities.Document.filter({ created_by_id: me.id }),
    ]).then(([p, s, m, d]) => { setProjects(p); setSubs(s); setMeasurements(m); setDocuments(d); setLoading(false); }));
  }, []);

  const generate = async () => {
    setGenerating(true);
    setReport(null);
    const project = selectedProject ? projects.find(p => p.id === selectedProject) : null;
    const filtMeasurements = selectedProject ? measurements.filter(m => m.project_id === selectedProject) : measurements;
    const subIds = project?.subcontractor_ids || [];
    const filtSubs = selectedProject ? subs.filter(s => subIds.includes(s.id)) : subs;
    const filtDocs = selectedProject ? documents.filter(d => subIds.includes(d.subcontractor_id)) : documents;

    const context = {
      project: project ? { name: project.name, status: project.status, progress: project.progress_percent, budget: project.budget, start: project.start_date, end: project.expected_end_date } : "Todas as obras",
      measurements: { total: filtMeasurements.length, approved: filtMeasurements.filter(m => m.status === "Aprovada").length, pending: filtMeasurements.filter(m => m.status === "Pendente").length, totalValue: filtMeasurements.filter(m => m.status === "Aprovada").reduce((s, m) => s + (m.total_value || 0), 0) },
      subcontractors: filtSubs.map(s => ({ name: s.company_name, score: s.score_total, specialty: s.specialty, status: s.status })),
      documents: { total: filtDocs.length, expired: filtDocs.filter(d => d.status === "Vencido").length, pending: filtDocs.filter(d => d.status === "Pendente").length }
    };

    const prompts = {
      executivo: `Gere um RELATÓRIO EXECUTIVO completo em português para o cliente/construtora sobre a obra. Use os dados: ${JSON.stringify(context)}. Inclua: situação geral, progresso, financeiro, equipes, riscos e próximos passos. Formato profissional em Markdown com seções claras.`,
      financeiro: `Gere um RELATÓRIO FINANCEIRO detalhado em português. Dados: ${JSON.stringify(context)}. Inclua: orçamento x executado, medições, pagamentos pendentes, projeção de custo final, análise de margem e alertas financeiros. Formato Markdown profissional.`,
      risco: `Gere um RELATÓRIO DE RISCO completo em português. Dados: ${JSON.stringify(context)}. Inclua: matriz de riscos, documentação irregular, performance de subempreiteiros, risco de atraso, risco financeiro, risco trabalhista e plano de ação. Formato Markdown profissional.`,
      produtividade: `Gere um RELATÓRIO DE PRODUTIVIDADE em português. Dados: ${JSON.stringify(context)}. Inclua: análise de performance por equipe, comparação de scores, medições aprovadas x rejeitadas, ranking dos empreiteiros, gaps de produtividade e recomendações. Formato Markdown profissional.`,
    };

    const res = await base44.integrations.Core.InvokeLLM({ prompt: prompts[reportType] });
    setReport({ content: res, type: reportType, project: project?.name || "Todas as obras", date: new Date().toLocaleDateString("pt-BR") });
    setGenerating(false);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Relatórios Automáticos" subtitle="Relatórios gerados por IA com base nos dados reais da plataforma" />
      <div className="p-6 max-w-4xl space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          {REPORT_TYPES.map(rt => (
            <button key={rt.id} onClick={() => setReportType(rt.id)} className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${reportType === rt.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"}`}>
              <rt.icon className={`h-5 w-5 mt-0.5 shrink-0 ${reportType === rt.id ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className={`text-sm font-semibold ${reportType === rt.id ? "text-primary" : ""}`}>{rt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <Label>Obra (opcional — deixe em branco para relatório geral)</Label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger><SelectValue placeholder="Todas as obras" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>Todas as obras</SelectItem>
              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generate} disabled={generating} className="w-full" size="lg">
          {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Gerando relatório com IA...</> : <><FileText className="h-4 w-4 mr-2" />Gerar Relatório</>}
        </Button>

        {report && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div>
                <p className="font-semibold text-sm">{REPORT_TYPES.find(r => r.id === report.type)?.label}</p>
                <p className="text-xs text-muted-foreground">{report.project} · {report.date}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                const el = document.createElement("a");
                el.href = "data:text/plain;charset=utf-8," + encodeURIComponent(report.content);
                el.download = `relatorio-${report.type}-${report.date}.txt`;
                el.click();
              }}>
                <Download className="h-3 w-3 mr-1.5" />Exportar
              </Button>
            </div>
            <div className="p-6">
              <ReactMarkdown className="prose prose-sm max-w-none [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm">
                {report.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
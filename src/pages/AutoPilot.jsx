import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Zap, AlertTriangle, DollarSign, FileText, Users, Building2,
  CheckCircle2, Clock, TrendingDown, ShoppingCart, ArrowRight,
  Loader2, Sparkles, RefreshCw, Bell, ChevronRight, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG = {
  financeiro: { icon: DollarSign, bg: "bg-red-50", border: "border-red-200", text: "text-red-700", iconBg: "bg-red-500", label: "Financeiro" },
  documento: { icon: FileText, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-500", label: "Documentos" },
  obra: { icon: Building2, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconBg: "bg-blue-500", label: "Obras" },
  empreiteiro: { icon: Users, bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", iconBg: "bg-violet-500", label: "Empreiteiros" },
  medicao: { icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", iconBg: "bg-emerald-500", label: "Medições" },
  estoque: { icon: ShoppingCart, bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", iconBg: "bg-orange-500", label: "Materiais" },
};

const URGENCY = {
  critico: { label: "CRÍTICO", bg: "bg-red-500" },
  urgente: { label: "URGENTE", bg: "bg-orange-500" },
  importante: { label: "IMPORTANTE", bg: "bg-amber-500" },
  atenção: { label: "ATENÇÃO", bg: "bg-blue-500" },
};

function buildActionItems(data) {
  const { projects, measurements, alerts, cashFlow, documents, subcontractors, supplies } = data;
  const items = [];
  const today = new Date();

  // Pagamentos atrasados
  cashFlow.filter(c => c.status === "Atrasado").forEach(c => {
    items.push({
      id: `cf-${c.id}`, category: "financeiro", urgency: "critico",
      title: `Pagamento atrasado: ${c.description}`,
      detail: `R$ ${(c.value || 0).toLocaleString("pt-BR")} · Venc: ${c.due_date || "N/A"}`,
      link: "/cash-flow",
    });
  });

  // Pagamentos a vencer em 3 dias
  cashFlow.filter(c => {
    if (c.status !== "A pagar" || !c.due_date) return false;
    const diff = (new Date(c.due_date) - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  }).forEach(c => {
    items.push({
      id: `cf-soon-${c.id}`, category: "financeiro", urgency: "urgente",
      title: `Pagamento vence em breve: ${c.description}`,
      detail: `R$ ${(c.value || 0).toLocaleString("pt-BR")} · ${c.due_date}`,
      link: "/cash-flow",
    });
  });

  // Medições pendentes
  const pendingM = measurements.filter(m => m.status === "Pendente");
  if (pendingM.length > 0) {
    items.push({
      id: "medicoes-pendentes", category: "medicao", urgency: "importante",
      title: `${pendingM.length} medição(ões) aguardando aprovação`,
      detail: `Total: R$ ${pendingM.reduce((s, m) => s + (m.total_value || 0), 0).toLocaleString("pt-BR")}`,
      link: "/measurements",
    });
  }

  // Obras atrasadas
  projects.filter(p => p.status === "Atrasada").forEach(p => {
    items.push({
      id: `proj-late-${p.id}`, category: "obra", urgency: "critico",
      title: `Obra atrasada: ${p.name}`,
      detail: `Cliente: ${p.client} · Progresso: ${p.progress_percent || 0}%`,
      link: `/projects/${p.id}/central`,
    });
  });

  // Obras sem progresso
  projects.filter(p => p.status === "Em andamento" && (p.progress_percent || 0) === 0).forEach(p => {
    items.push({
      id: `proj-zero-${p.id}`, category: "obra", urgency: "atenção",
      title: `Obra sem progresso registrado: ${p.name}`,
      detail: "Nenhuma medição aprovada ainda",
      link: `/projects/${p.id}/central`,
    });
  });

  // Documentos vencidos
  documents.filter(d => d.status === "Vencido").forEach(d => {
    items.push({
      id: `doc-${d.id}`, category: "documento", urgency: "urgente",
      title: `Documento vencido: ${d.type}`,
      detail: `Empreiteiro: ${d.subcontractor_name || "N/A"}`,
      link: "/documents",
    });
  });

  // Documentos vencendo em 7 dias
  documents.filter(d => {
    if (!d.expiry_date || d.status === "Vencido") return false;
    const diff = (new Date(d.expiry_date) - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).forEach(d => {
    items.push({
      id: `doc-soon-${d.id}`, category: "documento", urgency: "importante",
      title: `Documento vence em breve: ${d.type}`,
      detail: `${d.subcontractor_name || "N/A"} · Venc: ${d.expiry_date}`,
      link: "/documents",
    });
  });

  // Empreiteiros bloqueados em obras ativas
  subcontractors.filter(s => s.status === "Bloqueado").forEach(s => {
    items.push({
      id: `sub-blocked-${s.id}`, category: "empreiteiro", urgency: "urgente",
      title: `Empreiteiro bloqueado: ${s.company_name}`,
      detail: `Specialty: ${s.specialty} · Verificar situação`,
      link: `/subcontractors/${s.id}`,
    });
  });

  // Alertas críticos
  alerts.filter(a => a.severity === "Crítica" && !a.is_resolved).forEach(a => {
    items.push({
      id: `alert-${a.id}`, category: "obra", urgency: "critico",
      title: a.title,
      detail: a.description || "",
      link: "/alerts",
    });
  });

  // Estoque baixo ou em falta
  if (supplies) {
    supplies.filter(s => s.status === "Em falta" || s.status === "Baixo estoque").forEach(s => {
      items.push({
        id: `supply-${s.id}`, category: "estoque", urgency: s.priority === "Urgente" ? "urgente" : "importante",
        title: `${s.status}: ${s.name}`,
        detail: `Obra: ${s.project_name || "N/A"} · ${s.quantity_in_stock || 0} em estoque`,
        link: "/supplies",
      });
    });
  }

  // Sort by urgency
  const order = { critico: 0, urgente: 1, importante: 2, atenção: 3 };
  return items.sort((a, b) => (order[a.urgency] || 3) - (order[b.urgency] || 3));
}

function ActionItem({ item }) {
  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.obra;
  const urg = URGENCY[item.urgency] || URGENCY.atenção;
  const Icon = cat.icon;

  return (
    <Link to={item.link}>
      <div className={cn("flex items-center gap-3 px-4 py-3 hover:opacity-90 transition-opacity border-b border-border last:border-0", cat.bg)}>
        <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", cat.iconBg)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-full text-white shrink-0", urg.bg)}>{urg.label}</span>
            <p className={cn("text-xs font-bold truncate", cat.text)}>{item.title}</p>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{item.detail}</p>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3">
      <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center mb-2", color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-black">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AutoPilot() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [filter, setFilter] = useState("todos");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const [projects, subcontractors, measurements, alerts, documents, cashFlow, supplies] = await Promise.all([
      base44.entities.Project.list(),
      base44.entities.Subcontractor.list(),
      base44.entities.Measurement.list("-created_date", 200),
      base44.entities.Alert.filter({ is_resolved: false }),
      base44.entities.Document.list(),
      base44.entities.CashFlowEntry.list("-due_date", 200),
      base44.entities.Supply.list(),
    ]);
    setData({ projects, subcontractors, measurements, alerts, documents, cashFlow, supplies });
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const runAI = async () => {
    if (!data) return;
    setAiLoading(true);
    setAiMode(true);
    const { projects, measurements, alerts, cashFlow, documents, subcontractors } = data;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o sistema de IA do ControleJá. Modo Autopiloto ativado.

Analise TODOS os dados abaixo e gere um relatório executivo completo com ações prioritárias.

DADOS DO SISTEMA:
- Obras: ${JSON.stringify(projects.map(p => ({ nome: p.name, tipo: p.project_type, status: p.status, progresso: p.progress_percent, orcamento: p.budget })))}
- Medições pendentes: ${measurements.filter(m => m.status === "Pendente").length}
- Medições aprovadas (30 últimas): ${measurements.filter(m => m.status === "Aprovada").slice(0, 30).length}
- Alertas críticos: ${alerts.filter(a => a.severity === "Crítica").length}
- Pagamentos atrasados: ${cashFlow.filter(c => c.status === "Atrasado").length} totalizando R$ ${cashFlow.filter(c => c.status === "Atrasado").reduce((s, c) => s + (c.value || 0), 0).toLocaleString("pt-BR")}
- Documentos vencidos: ${documents.filter(d => d.status === "Vencido").length}
- Empreiteiros ativos: ${subcontractors.filter(s => s.status === "Ativo").length}

Gere análise detalhada com linguagem de gerente de obras experiente.`,
      response_json_schema: {
        type: "object",
        properties: {
          status_geral: { type: "string", enum: ["Operação Saudável", "Requer Atenção", "Situação Crítica"] },
          resumo: { type: "string" },
          acoes_imediatas: { type: "array", items: { type: "object", properties: { acao: { type: "string" }, impacto: { type: "string" }, prazo: { type: "string" } } } },
          riscos_detectados: { type: "array", items: { type: "string" } },
          oportunidades: { type: "array", items: { type: "string" } },
          previsao_proximos_30_dias: { type: "string" }
        }
      }
    });
    setAiResult(result);
    setAiLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground font-semibold">Carregando Autopiloto...</p>
      </div>
    </div>
  );

  const items = buildActionItems(data);
  const categories = ["todos", "financeiro", "obra", "medicao", "documento", "empreiteiro", "estoque"];
  const catLabels = { todos: "Todos", financeiro: "Financeiro", obra: "Obras", medicao: "Medições", documento: "Docs", empreiteiro: "Empreiteiros", estoque: "Materiais" };
  const filtered = filter === "todos" ? items : items.filter(i => i.category === filter);
  const criticalCount = items.filter(i => i.urgency === "critico").length;

  const { projects, measurements, cashFlow, subcontractors } = data;
  const saldo = cashFlow.filter(c => c.type === "Receita").reduce((s, c) => s + c.value, 0) -
                cashFlow.filter(c => c.type === "Despesa").reduce((s, c) => s + c.value, 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 px-4 pt-5 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-6 rounded-lg bg-violet-500 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-violet-300 text-xs font-bold uppercase tracking-widest">Autopiloto</span>
            </div>
            <h1 className="text-white text-2xl font-black">Central de Controle</h1>
            <p className="text-white/50 text-xs mt-1">Tudo que precisa da sua atenção, em um lugar</p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing} className="h-8 w-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <RefreshCw className={cn("h-4 w-4 text-white", refreshing && "animate-spin")} />
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Obras ativas", value: projects.filter(p => p.status === "Em andamento").length, color: "text-blue-300" },
            { label: "Pendências", value: items.length, color: criticalCount > 0 ? "text-red-300" : "text-white" },
            { label: "Críticos", value: criticalCount, color: "text-red-400" },
            { label: "Saldo", value: `${saldo >= 0 ? "+" : "-"}R$${Math.abs(saldo / 1000).toFixed(0)}k`, color: saldo >= 0 ? "text-emerald-300" : "text-red-300" },
          ].map((m, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className={cn("text-lg font-black", m.color)}>{m.value}</p>
              <p className="text-white/50 text-[9px] font-semibold">{m.label}</p>
            </div>
          ))}
        </div>

        {/* AI Autopilot Button */}
        <button
          onClick={runAI}
          disabled={aiLoading}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all",
            aiResult ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 shadow-lg"
          )}
        >
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            {aiLoading ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Sparkles className="h-5 w-5 text-white" />}
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-black text-sm">{aiResult ? "Análise IA completa ✓" : "Ativar Modo Autopiloto"}</p>
            <p className="text-white/60 text-xs">{aiLoading ? "Analisando toda a operação..." : aiResult ? "Toque para rever a análise" : "IA analisa toda a sua operação agora"}</p>
          </div>
          {!aiLoading && <Play className="h-5 w-5 text-white/50" />}
        </button>
      </div>

      {/* AI Result */}
      {aiResult && (
        <div className="mx-4 mt-4 bg-card border border-violet-200 rounded-2xl overflow-hidden">
          <div className={cn("px-4 py-3 border-b", {
            "bg-emerald-50": aiResult.status_geral === "Operação Saudável",
            "bg-amber-50": aiResult.status_geral === "Requer Atenção",
            "bg-red-50": aiResult.status_geral === "Situação Crítica",
          })}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <p className="font-black text-sm text-violet-900">Autopiloto IA · {aiResult.status_geral}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{aiResult.resumo}</p>
          </div>

          <div className="p-4 space-y-4">
            {aiResult.acoes_imediatas?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Ações Imediatas</p>
                <div className="space-y-2">
                  {aiResult.acoes_imediatas.map((a, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-3">
                      <p className="text-xs font-bold">{a.acao}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground">Impacto: {a.impacto}</span>
                        <span className="text-[10px] text-primary font-semibold">{a.prazo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiResult.riscos_detectados?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Riscos Detectados</p>
                <div className="space-y-1">
                  {aiResult.riscos_detectados.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiResult.oportunidades?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Oportunidades</p>
                <div className="space-y-1">
                  {aiResult.oportunidades.map((o, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{o}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiResult.previsao_proximos_30_dias && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 mb-1">Previsão dos próximos 30 dias</p>
                <p className="text-xs text-violet-800">{aiResult.previsao_proximos_30_dias}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-sm">O que precisa da sua atenção</h2>
          <span className={cn("text-xs font-black px-2.5 py-1 rounded-full text-white", criticalCount > 0 ? "bg-red-500" : "bg-slate-400")}>{items.length}</span>
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all",
                filter === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {catLabels[cat]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="font-bold text-sm">Tudo em ordem!</p>
            <p className="text-xs text-muted-foreground text-center">Nenhuma pendência crítica nesta categoria.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {filtered.map(item => <ActionItem key={item.id} item={item} />)}
          </div>
        )}
      </div>

      {/* Quick access */}
      <div className="px-4 pt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Acesso Rápido</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { to: "/measurements/new", label: "Nova Medição", icon: CheckCircle2, color: "from-blue-500 to-blue-600" },
            { to: "/cash-flow", label: "Fluxo de Caixa", icon: DollarSign, color: "from-emerald-500 to-green-600" },
            { to: "/alerts", label: "Central de Alertas", icon: Bell, color: "from-red-500 to-rose-600" },
            { to: "/ai-assistant", label: "Assistente IA", icon: Sparkles, color: "from-violet-500 to-purple-600" },
          ].map(q => (
            <Link key={q.to} to={q.to} className={`bg-gradient-to-br ${q.color} rounded-2xl p-4 hover:opacity-90 transition-opacity`}>
              <q.icon className="h-5 w-5 text-white mb-2" />
              <p className="text-white text-sm font-bold">{q.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

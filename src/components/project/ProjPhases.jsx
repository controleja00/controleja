import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  ChevronDown, ChevronUp, Sparkles, AlertTriangle, CheckCircle2, Loader2, Edit3, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Calculate per-phase progress from measurements
function calcPhaseProgress(phase, measurements) {
  // Try matching measurements by service name (case-insensitive contains)
  const matching = measurements.filter(
    m => m.status === "Aprovada" &&
    (m.service?.toLowerCase().includes(phase.name?.toLowerCase()) ||
     phase.name?.toLowerCase().includes(m.service?.toLowerCase()))
  );
  const measuredExec = matching.reduce((s, m) => s + (Number(m.executed_qty) || 0), 0);
  const executedQty = Math.max(Number(phase.executed_qty) || 0, measuredExec);
  const contractedQty = Number(phase.contracted_qty) || 0;
  if (contractedQty === 0) return phase.status === "Concluída" ? 100 : 0;
  return Math.min(100, Math.round((executedQty / contractedQty) * 100));
}

function getPhaseStatus(phase, progress) {
  if (phase.status === "Concluída" || progress >= 100) return "Concluída";
  if (phase.status === "Atrasada") return "Atrasada";
  if (progress > 0) return "Em andamento";
  return "Pendente";
}

const STATUS_CONFIG = {
  "Concluída":    { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Concluída" },
  "Em andamento": { bar: "bg-secondary0",    badge: "bg-secondary text-primary",       dot: "bg-secondary0",    label: "Em andamento" },
  "Atenção":      { bar: "bg-amber-400",   badge: "bg-amber-100 text-amber-700",     dot: "bg-amber-400",   label: "Atenção" },
  "Atrasada":     { bar: "bg-red-500",     badge: "bg-red-100 text-red-700",         dot: "bg-red-500",     label: "Atrasada" },
  "Pendente":     { bar: "bg-slate-300",   badge: "bg-slate-100 text-slate-500",     dot: "bg-slate-300",   label: "Pendente" },
};

function ProgressBar({ pct, status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pendente"];
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", cfg.bar)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PhaseCard({ phase, measurements, idx }) {
  const [open, setOpen] = useState(false);
  const progress = calcPhaseProgress(phase, measurements);
  const status = getPhaseStatus(phase, progress);
  const cfg = STATUS_CONFIG[status];

  const approvedMeasurements = measurements.filter(
    m => m.status === "Aprovada" &&
    (m.service?.toLowerCase().includes(phase.name?.toLowerCase()) ||
     phase.name?.toLowerCase().includes(m.service?.toLowerCase()))
  );
  const totalApproved = approvedMeasurements.reduce((s, m) => s + (Number(m.total_value) || 0), 0);

  return (
    <div className={cn("rounded-2xl border overflow-hidden transition-all", open ? "border-primary/30 shadow-sm" : "border-border")}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Sequence number */}
        <div className={cn("h-7 w-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 text-white", cfg.dot)}>
          {status === "Concluída" ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-bold truncate">{phase.name}</p>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cfg.badge)}>{cfg.label}</span>
              <span className="text-xs font-black text-muted-foreground">{progress}%</span>
            </div>
          </div>
          <ProgressBar pct={progress} status={status} />
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px] text-muted-foreground">
              {phase.contracted_qty > 0
                ? `${Number(phase.executed_qty || 0).toLocaleString("pt-BR")} / ${Number(phase.contracted_qty).toLocaleString("pt-BR")} ${phase.unit || ""}`
                : phase.unit || ""}
            </p>
            <p className="text-[10px] font-semibold text-primary">Peso: {phase.weight}%</p>
          </div>
        </div>

        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/10 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card rounded-xl p-3 border border-border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Contratado</p>
              <p className="text-sm font-black mt-0.5">{Number(phase.contracted_qty || 0).toLocaleString("pt-BR")} <span className="text-xs font-normal text-muted-foreground">{phase.unit}</span></p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Executado</p>
              <p className="text-sm font-black mt-0.5 text-primary">{Number(phase.executed_qty || 0).toLocaleString("pt-BR")} <span className="text-xs font-normal text-muted-foreground">{phase.unit}</span></p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Medições</p>
              <p className="text-sm font-black mt-0.5 text-emerald-600">R$ {totalApproved.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          {phase.responsible && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {phase.responsible[0]?.toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground">Responsável: <strong className="text-foreground">{phase.responsible}</strong></span>
            </div>
          )}

          {approvedMeasurements.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Medições aprovadas nesta fase:</p>
              <div className="space-y-1.5">
                {approvedMeasurements.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border">
                    <span className="text-xs truncate">{m.service}</span>
                    <span className="text-xs font-bold text-emerald-600 shrink-0 ml-2">
                      R$ {(m.total_value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subfases if present */}
          {phase.subfases?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2">Subfases:</p>
              <div className="space-y-1.5">
                {phase.subfases.map((sf, si) => (
                  <div key={si} className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    <span className="text-xs flex-1">{sf.name}</span>
                    <span className="text-xs text-muted-foreground">{sf.progress || 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjPhases({ project, measurements }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const phases = project.phases || [];
  const hasPhases = phases.length > 0;

  // Overall progress weighted
  const overallProgress = hasPhases
    ? Math.round(phases.reduce((sum, phase) => {
        const prog = calcPhaseProgress(phase, measurements);
        return sum + (prog * (Number(phase.weight) || 0)) / 100;
      }, 0))
    : project.progress_percent || 0;

  const completedPhases = phases.filter(p => calcPhaseProgress(p, measurements) >= 100).length;
  const inProgressPhases = phases.filter(p => { const prog = calcPhaseProgress(p, measurements); return prog > 0 && prog < 100; }).length;
  const atrasadas = phases.filter(p => p.status === "Atrasada").length;

  const runAIAnalysis = async () => {
    setLoadingAI(true);
    const phasesSummary = phases.map(p => ({
      fase: p.name,
      peso: p.weight,
      contratado: p.contracted_qty,
      executado: p.executed_qty || 0,
      unidade: p.unit,
      progresso: calcPhaseProgress(p, measurements),
      status: p.status,
    }));
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em gestão de obras de construção civil.
Analise as fases da obra abaixo e forneça uma análise de risco e previsão por fase.

Obra: ${project.name}
Tipo: ${project.project_type || "N/A"}
Progresso geral: ${overallProgress}%

Fases:
${JSON.stringify(phasesSummary, null, 2)}

Medições aprovadas: ${measurements.filter(m => m.status === "Aprovada").length}
Valor total medido: R$ ${measurements.filter(m => m.status === "Aprovada").reduce((s, m) => s + (m.total_value || 0), 0).toLocaleString("pt-BR")}

Para cada fase, analise: risco de atraso (%), produtividade atual vs meta, recomendação de ação.
Seja objetivo e use linguagem técnica-operacional.`,
      response_json_schema: {
        type: "object",
        properties: {
          resumo: { type: "string" },
          alertas_criticos: { type: "array", items: { type: "string" } },
          fases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                fase: { type: "string" },
                risco_atraso_pct: { type: "number" },
                status_produtividade: { type: "string", enum: ["Acima da meta", "Na meta", "Abaixo da meta", "Parada"] },
                recomendacao: { type: "string" }
              }
            }
          },
          previsao_conclusao: { type: "string" }
        }
      }
    });
    setAiAnalysis(result);
    setLoadingAI(false);
  };

  if (!hasPhases) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Edit3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm">Esta obra não tem fases configuradas</p>
          <p className="text-xs text-muted-foreground mt-1">Edite a obra para adicionar o mapa de fases com templates adaptados ao tipo da obra.</p>
        </div>
        <Link to={`/projects/${project.id}`}>
          <Button variant="outline" size="sm">Configurar Fases</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-busk-navy to-busk-blue rounded-2xl p-4 text-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">Progresso Global</p>
            <p className="text-4xl font-black mt-0.5">{overallProgress}<span className="text-xl text-white/60">%</span></p>
            {project.project_type && <p className="text-white/50 text-xs mt-1">{project.project_type}</p>}
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-white/70">{completedPhases} concluídas</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#8096bc]" />
              <span className="text-[11px] text-white/70">{inProgressPhases} em andamento</span>
            </div>
            {atrasadas > 0 && (
              <div className="flex items-center justify-end gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                <span className="text-[11px] text-white/70">{atrasadas} atrasadas</span>
              </div>
            )}
          </div>
        </div>

        {/* Multi-phase progress bar */}
        <div className="h-3 rounded-full bg-white/10 overflow-hidden flex">
          {phases.map((phase, i) => {
            const prog = calcPhaseProgress(phase, measurements);
            const status = getPhaseStatus(phase, prog);
            const colors = {
              "Concluída": "bg-emerald-400",
              "Em andamento": "bg-[#8096bc]",
              "Atrasada": "bg-red-400",
              "Pendente": "bg-white/10",
              "Atenção": "bg-amber-400"
            };
            const fill = prog * (phase.weight / 100);
            return (
              <div
                key={i}
                className="h-full relative"
                style={{ width: `${phase.weight}%` }}
                title={`${phase.name}: ${prog}%`}
              >
                <div className="absolute inset-0 bg-white/5" />
                <div className={cn("h-full transition-all", colors[status] || "bg-white/20")} style={{ width: `${prog}%` }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-white/40">0%</span>
          <span className="text-[10px] text-white/40">100%</span>
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-2">
        {phases.map((phase, idx) => (
          <PhaseCard key={idx} phase={phase} measurements={measurements} idx={idx} />
        ))}
      </div>

      {/* AI Analysis */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-bold">Análise de IA por Fase</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={runAIAnalysis}
            disabled={loadingAI}
            className="h-7 text-xs"
          >
            {loadingAI ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Analisando...</> : "Analisar"}
          </Button>
        </div>

        {!aiAnalysis && !loadingAI && (
          <div className="px-4 py-5 text-center">
            <p className="text-xs text-muted-foreground">Clique em "Analisar" para obter previsões de atraso, produtividade e recomendações por fase.</p>
          </div>
        )}

        {loadingAI && (
          <div className="px-4 py-5 text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-violet-500 mx-auto" />
            <p className="text-xs text-muted-foreground">A IA está analisando cada fase da obra...</p>
          </div>
        )}

        {aiAnalysis && (
          <div className="p-4 space-y-4">
            {/* Summary */}
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
              <p className="text-xs text-violet-800">{aiAnalysis.resumo}</p>
              {aiAnalysis.previsao_conclusao && (
                <p className="text-xs text-violet-600 font-semibold mt-2">📅 {aiAnalysis.previsao_conclusao}</p>
              )}
            </div>

            {/* Critical alerts */}
            {aiAnalysis.alertas_criticos?.length > 0 && (
              <div className="space-y-1.5">
                {aiAnalysis.alertas_criticos.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{alert}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Per-phase analysis */}
            <div className="space-y-2">
              {aiAnalysis.fases?.map((fa, i) => {
                const prodConfig = {
                  "Acima da meta": { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                  "Na meta": { icon: Minus, color: "text-primary", bg: "bg-secondary" },
                  "Abaixo da meta": { icon: TrendingDown, color: "text-amber-600", bg: "bg-amber-50" },
                  "Parada": { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
                }[fa.status_produtividade] || { icon: Minus, color: "text-slate-500", bg: "bg-slate-50" };
                const Icon = prodConfig.icon;
                const risco = fa.risco_atraso_pct || 0;

                return (
                  <div key={i} className="border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold">{fa.fase}</p>
                      <div className="flex items-center gap-2">
                        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", prodConfig.bg, prodConfig.color)}>
                          <Icon className="h-3 w-3" />
                          {fa.status_produtividade}
                        </div>
                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full",
                          risco >= 70 ? "bg-red-100 text-red-700" :
                          risco >= 40 ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        )}>
                          {risco}% risco
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{fa.recomendacao}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit link */}
      <Link to={`/projects/${project.id}`} className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground hover:text-primary transition-colors font-semibold">
        <Edit3 className="h-3.5 w-3.5" />
        Editar fases da obra
      </Link>
    </div>
  );
}
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Clock, Target, Pencil, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditRevenueModal from "./EditRevenueModal";
import EditProgressModal from "./EditProgressModal";
import EditProjectDataModal from "./EditProjectDataModal";
import ProgressHistory from "./ProgressHistory";

const fmt = (v) => {
  if (!v && v !== 0) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1000000) return `${sign}R$${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}R$${(abs / 1000).toFixed(0)}k`;
  return `${sign}R$${abs.toLocaleString("pt-BR")}`;
};

function ProgressRow({ label, pct, color, value, onEdit }) {
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground font-medium">{label}</span>
          {onEdit && (
            <button onClick={onEdit} className="h-5 w-5 rounded flex items-center justify-center hover:bg-muted transition-colors">
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <span className="font-bold text-foreground">{value || `${pct}%`}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}

function MetricPill({ label, value, color, icon: IconComp, empty, onEdit }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 relative group">
      <div className="flex items-center gap-1.5 mb-1">
        {IconComp && <IconComp className={`h-3.5 w-3.5 ${color}`} />}
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide flex-1">{label}</p>
        {onEdit && (
          <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center hover:bg-muted transition-all">
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>
      {empty ? (
        <button onClick={onEdit} className="text-xs text-primary hover:underline font-medium">{empty}</button>
      ) : (
        <p className={`text-lg font-black ${color}`}>{value}</p>
      )}
    </div>
  );
}

export default function ProjOverview({ project: initialProject, measurements, onProjectUpdated }) {
  const [project, setProject] = useState(initialProject);
  const [showRevenue, setShowRevenue] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showData, setShowData] = useState(false);

  const handleProjectSaved = (updated) => {
    setProject(updated);
    onProjectUpdated?.(updated);
  };

  const approved = measurements.filter(m => m.status === "Aprovada");
  const pending = measurements.filter(m => m.status === "Pendente");

  const contracted = project.contracted_value || 0;
  const budget = project.budget || 0;
  const physProgress = project.progress_percent || 0;

  const totalMeasured = approved.reduce((s, m) => s + (m.total_value || 0), 0);
  const finProgress = contracted > 0 ? Math.min(100, Math.round((totalMeasured / contracted) * 100)) : 0;

  const today = new Date();
  const start = project.start_date ? new Date(project.start_date) : null;
  const end = project.expected_end_date ? new Date(project.expected_end_date) : null;
  const daysElapsed = start ? Math.floor((today - start) / 86400000) : 0;
  const daysRemaining = end ? Math.max(0, Math.floor((end - today) / 86400000)) : null;
  const totalDays = start && end ? Math.floor((end - start) / 86400000) : 0;
  const timeProgress = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;

  const lucroProjetado = contracted > 0 && budget > 0 ? contracted - budget : null;
  const margemProjetada = contracted > 0 && lucroProjetado !== null ? ((lucroProjetado / contracted) * 100).toFixed(1) : null;

  const budgetRisk = budget > 0 && totalMeasured > budget * 0.9 && physProgress < 80;
  const timeRisk = timeProgress > physProgress + 20;
  const marginRisk = margemProjetada !== null && Number(margemProjetada) < 5;

  const alerts = [];
  if (budgetRisk) alerts.push({ color: "bg-red-50 border-red-200", text: "text-red-700", icon: AlertTriangle, msg: `Obra consumiu ${Math.round((totalMeasured / budget) * 100)}% do orçamento, mas progresso físico é só ${physProgress}%. Risco de estouro.` });
  if (timeRisk) alerts.push({ color: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock, msg: `${timeProgress}% do prazo consumido, mas obra está ${physProgress}% executada. Risco de atraso.` });
  if (marginRisk && contracted > 0) alerts.push({ color: "bg-orange-50 border-orange-200", text: "text-orange-700", icon: TrendingDown, msg: `Margem projetada de ${margemProjetada}% está abaixo do recomendado (5%).` });

  return (
    <div className="space-y-4">
      {/* Edit quick actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">Central da Obra</p>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setShowData(true)}>
          <Settings className="h-3.5 w-3.5" /> Editar Dados da Obra
        </Button>
      </div>

      {/* Risk alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-3 border rounded-2xl px-4 py-3 ${a.color}`}>
              <a.icon className={`h-4 w-4 shrink-0 mt-0.5 ${a.text}`} />
              <p className={`text-xs font-semibold ${a.text}`}>{a.msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricPill
          label="Receita Contratada"
          value={contracted > 0 ? fmt(contracted) : null}
          empty={contracted <= 0 ? "Definir receita" : null}
          color="text-primary"
          icon={DollarSign}
          onEdit={() => setShowRevenue(true)}
        />
        <MetricPill
          label="Orçamento Previsto"
          value={budget > 0 ? fmt(budget) : null}
          empty={budget <= 0 ? "Definir orçamento" : null}
          color="text-foreground"
          icon={Target}
          onEdit={() => setShowData(true)}
        />
        <MetricPill
          label="Lucro Projetado"
          value={lucroProjetado !== null ? fmt(lucroProjetado) : null}
          empty={lucroProjetado === null ? "Sem dados" : null}
          color={lucroProjetado !== null && lucroProjetado >= 0 ? "text-emerald-600" : "text-red-600"}
          icon={lucroProjetado === null || lucroProjetado >= 0 ? TrendingUp : TrendingDown}
        />
        <MetricPill
          label="Margem Projetada"
          value={margemProjetada !== null ? `${margemProjetada}%` : null}
          empty={margemProjetada === null ? "Sem dados" : null}
          color={margemProjetada === null ? "text-muted-foreground" : Number(margemProjetada) >= 10 ? "text-emerald-600" : Number(margemProjetada) >= 5 ? "text-amber-600" : "text-red-600"}
          icon={TrendingUp}
        />
      </div>

      {/* Cálculos financeiros detalhados */}
      {(contracted > 0 || budget > 0) && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Resumo Financeiro</p>
          {[
            { label: "Receita Contratada", val: contracted > 0 ? fmt(contracted) : "Não informada", highlight: contracted <= 0 },
            { label: "Orçamento Previsto", val: budget > 0 ? fmt(budget) : "Não informado", highlight: budget <= 0 },
            { label: "Gasto Realizado (medições)", val: totalMeasured > 0 ? fmt(totalMeasured) : "Sem gastos registrados", highlight: false },
            { label: "Saldo Restante", val: budget > 0 ? fmt(Math.max(0, budget - totalMeasured)) : "—", highlight: false },
            { label: "Progresso Financeiro", val: contracted > 0 ? `${finProgress}%` : "—", highlight: false },
          ].map(r => (
            <div key={r.label} className="flex justify-between items-center text-xs py-1 border-b border-border last:border-0">
              <span className="text-muted-foreground">{r.label}</span>
              <span className={`font-semibold ${r.highlight ? "text-amber-600" : "text-foreground"}`}>{r.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bars */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Progresso da Obra</h3>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary" onClick={() => setShowProgress(true)}>
            <Pencil className="h-3 w-3" /> Atualizar
          </Button>
        </div>
        <ProgressRow label="Progresso Físico" pct={physProgress} color="bg-secondary0" onEdit={() => setShowProgress(true)} />
        <ProgressRow label="Progresso Financeiro" pct={finProgress} color="bg-emerald-500" value={`${finProgress}% · ${fmt(totalMeasured)}`} />
        <ProgressRow label="Tempo Decorrido" pct={timeProgress} color={timeRisk ? "bg-red-400" : "bg-amber-400"} value={`${timeProgress}% · ${daysRemaining !== null ? `${daysRemaining} dias` : "—"}`} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Já executado</p>
          <p className="text-base font-black text-primary">{fmt(totalMeasured)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Falta gastar</p>
          <p className={`text-base font-black ${budget > 0 && (budget - totalMeasured) >= 0 ? "text-foreground" : "text-red-600"}`}>
            {budget > 0 ? fmt(Math.max(0, budget - totalMeasured)) : "—"}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
          <p className={`text-base font-black ${pending.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>{pending.length}</p>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-primary mb-1">Próximos passos</p>
        {contracted <= 0 && <p className="text-xs text-amber-700">• Receita contratada não informada — <button className="underline font-medium" onClick={() => setShowRevenue(true)}>Definir agora</button></p>}
        {pending.length > 0 && <p className="text-xs text-muted-foreground">• Aprovar {pending.length} medição(ões) pendente(s)</p>}
        {daysRemaining !== null && daysRemaining < 30 && <p className="text-xs text-muted-foreground">• Obra vence em {daysRemaining} dias</p>}
        {physProgress < 100 && <p className="text-xs text-muted-foreground">• {100 - physProgress}% do progresso físico restante</p>}
        {!pending.length && daysRemaining !== null && daysRemaining >= 30 && physProgress >= 90 && contracted > 0 && (
          <p className="text-xs text-emerald-700 font-medium">✓ Obra no caminho certo</p>
        )}
      </div>

      {/* Histórico de Progresso */}
      <ProgressHistory projectId={project.id} />

      {/* Modals */}
      <EditRevenueModal open={showRevenue} onClose={() => setShowRevenue(false)} project={project} onSaved={handleProjectSaved} />
      <EditProgressModal open={showProgress} onClose={() => setShowProgress(false)} project={project} onSaved={handleProjectSaved} />
      <EditProjectDataModal open={showData} onClose={() => setShowData(false)} project={project} onSaved={handleProjectSaved} />
    </div>
  );
}
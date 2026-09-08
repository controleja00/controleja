import { DollarSign, TrendingUp, TrendingDown, FileText, AlertTriangle, Clock, Pencil } from "lucide-react";

function KPI({ label, value, sub, color = "text-foreground", icon: IconComp, onEdit }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 relative group">
      <div className="flex items-start justify-between mb-1.5">
        {IconComp && <IconComp className={`h-4 w-4 ${color} opacity-70`} />}
        <div className="flex items-center gap-1">
          {onEdit && (
            <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center hover:bg-muted transition-all">
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <span className={`text-xl font-black ${color}`}>{value}</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-foreground/80 leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ProjKPIs({ project, measurements, subs, documents, onEditProgress }) {
  const approved = measurements.filter(m => m.status === "Aprovada");
  const pending = measurements.filter(m => m.status === "Pendente");
  const totalMeasured = approved.reduce((s, m) => s + (m.total_value || 0), 0);
  const contracted = project.contracted_value || 0;
  const budget = project.budget || 0;
  const physProgress = project.progress_percent || 0;

  const lucroProjetado = contracted - budget;
  const margem = contracted > 0 ? ((lucroProjetado / contracted) * 100).toFixed(0) : 0;

  const fmt = (v) => {
    const abs = Math.abs(v);
    const sign = v < 0 ? "-" : "";
    if (abs >= 1000000) return `${sign}R$${(abs / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${sign}R$${(abs / 1000).toFixed(0)}k`;
    return `${sign}R$${abs.toLocaleString("pt-BR")}`;
  };

  const today = new Date();
  const end = project.expected_end_date ? new Date(project.expected_end_date) : null;
  const daysRemaining = end ? Math.max(0, Math.floor((end - today) / 86400000)) : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <KPI
        label="Progresso Físico"
        value={`${physProgress}%`}
        color="text-primary"
        icon={TrendingUp}
        sub={`${100 - physProgress}% restante`}
        onEdit={onEditProgress}
      />
      <KPI
        label="Lucro Projetado"
        value={contracted > 0 ? fmt(lucroProjetado) : "—"}
        color={lucroProjetado >= 0 ? "text-emerald-600" : "text-red-600"}
        icon={lucroProjetado >= 0 ? TrendingUp : TrendingDown}
        sub={contracted > 0 ? `Margem: ${margem}%` : "sem dados"}
      />
      <KPI
        label="Já Executado"
        value={fmt(totalMeasured)}
        color="text-blue-600"
        icon={DollarSign}
        sub={`${budget > 0 ? Math.round((totalMeasured / budget) * 100) : 0}% do orçamento`}
      />
      <KPI
        label="Medições Pendentes"
        value={pending.length}
        color={pending.length > 0 ? "text-amber-600" : "text-emerald-600"}
        icon={Clock}
        sub={`${approved.length} aprovadas`}
      />
      <KPI
        label="Prazo"
        value={daysRemaining !== null ? `${daysRemaining}d` : "—"}
        color={daysRemaining !== null && daysRemaining < 30 ? "text-red-600" : "text-foreground"}
        icon={AlertTriangle}
        sub={project.expected_end_date || "sem data"}
      />
      <KPI
        label="Docs Vencidos"
        value={documents.filter(d => d.status === "Vencido").length}
        color={documents.filter(d => d.status === "Vencido").length > 0 ? "text-red-600" : "text-emerald-600"}
        icon={FileText}
        sub={`${documents.length} no total`}
      />
    </div>
  );
}
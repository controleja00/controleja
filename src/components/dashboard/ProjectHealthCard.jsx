import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const getHealth = (project, alerts, cashFlow, documents) => {
  const projectAlerts = alerts.filter(a => a.related_id === project.id);
  const hasCritical = projectAlerts.some(a => a.severity === "Crítica");
  const hasHigh = projectAlerts.some(a => a.severity === "Alta");
  const isDelayed = project.status === "Atrasada";
  const isParalyzed = project.status === "Paralisada";

  if (hasCritical || isParalyzed) return "critical";
  if (hasHigh || isDelayed) return "warning";
  return "healthy";
};

const healthStyles = {
  healthy: { dot: "bg-emerald-500", bar: "bg-emerald-500", label: "Saudável", text: "text-emerald-600" },
  warning: { dot: "bg-amber-500", bar: "bg-amber-500", label: "Atenção", text: "text-amber-600" },
  critical: { dot: "bg-red-500", bar: "bg-red-500", label: "Crítico", text: "text-red-600" },
};

const statusColor = {
  "Em andamento": "text-emerald-600",
  "Planejamento": "text-blue-600",
  "Atrasada": "text-red-600",
  "Concluída": "text-gray-500",
  "Paralisada": "text-red-700",
};

export default function ProjectHealthCard({ project, alerts, cashFlow, documents }) {
  const health = getHealth(project, alerts, cashFlow, documents);
  const hs = healthStyles[health];
  const progress = project.progress_percent || 0;

  return (
    <Link to={`/projects/${project.id}/central`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors">
      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${hs.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-bold truncate">{project.name}</p>
          <span className={`text-[11px] font-semibold ${statusColor[project.status] || "text-muted-foreground"}`}>{project.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${hs.bar} rounded-full transition-all`} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11px] font-bold text-muted-foreground shrink-0">{progress}%</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
import { Building2, Calendar, Clock, MapPin, User, TrendingUp } from "lucide-react";

const statusConfig = {
  "Em andamento": { color: "bg-emerald-500", label: "Em andamento" },
  "Planejamento": { color: "bg-secondary0", label: "Planejamento" },
  "Atrasada": { color: "bg-red-500", label: "Atrasada" },
  "Paralisada": { color: "bg-gray-500", label: "Paralisada" },
  "Concluída": { color: "bg-purple-500", label: "Concluída" },
};

export default function ProjHeader({ project, measurements }) {
  const today = new Date();
  const start = project.start_date ? new Date(project.start_date) : null;
  const end = project.expected_end_date ? new Date(project.expected_end_date) : null;
  const daysElapsed = start ? Math.floor((today - start) / 86400000) : 0;
  const daysRemaining = end ? Math.max(0, Math.floor((end - today) / 86400000)) : null;
  const totalDays = start && end ? Math.floor((end - start) / 86400000) : 0;
  const timeProgress = totalDays > 0 ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : 0;
  const physicalProgress = project.progress_percent || 0;
  const deviation = physicalProgress - timeProgress;

  const totalBudget = project.budget || 0;
  const spent = measurements.filter(m => m.status === "Aprovada").reduce((s, m) => s + (m.total_value || 0), 0);
  const financialProgress = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;

  const cfg = statusConfig[project.status] || statusConfig["Em andamento"];

  return (
    <div className="bg-gradient-to-br from-primary/90 to-primary text-white px-4 pt-4 pb-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Building2 className="h-7 w-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl font-bold">{project.name}</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${cfg.color}`}>{cfg.label}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80">
            {project.client && <span className="flex items-center gap-1"><User className="h-3 w-3" />{project.client}</span>}
            {project.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.address}</span>}
            {project.technical_responsible && <span className="flex items-center gap-1"><User className="h-3 w-3" />{project.technical_responsible}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Dias decorridos", value: daysElapsed, icon: Calendar },
          { label: "Dias restantes", value: daysRemaining !== null ? daysRemaining : "—", icon: Clock },
          { label: "Progresso físico", value: `${physicalProgress}%`, icon: TrendingUp },
          { label: "Desvio", value: deviation >= 0 ? `+${deviation}%` : `${deviation}%`, icon: TrendingUp, color: deviation >= 0 ? "text-emerald-300" : "text-red-300" },
        ].map(s => (
          <div key={s.label} className="bg-white/10 rounded-xl p-3">
            <p className={`text-xl font-black ${s.color || "text-white"}`}>{s.value}</p>
            <p className="text-[10px] text-white/70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Progresso Físico</span><span>{physicalProgress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${physicalProgress}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Progresso Financeiro</span><span>{financialProgress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${financialProgress}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Tempo Decorrido</span><span>{timeProgress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${timeProgress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, AlertTriangle, Camera, DollarSign, Calendar, MapPin } from "lucide-react";

const getHealthInfo = (project, alerts, cashFlow) => {
  const critical = alerts.filter(a => a.related_id === project?.id && a.severity === "Crítica").length;
  const overdue = cashFlow.filter(c => c.status === "Atrasado").length;
  if (critical >= 1 || project?.status === "Paralisada") return { emoji: "🔴", label: "Precisa de Atenção", color: "bg-red-500", bg: "from-red-900 to-red-700" };
  if (project?.status === "Atrasada" || overdue >= 2) return { emoji: "🟡", label: "Em Atenção", color: "bg-amber-500", bg: "from-amber-900 to-amber-700" };
  return { emoji: "🟢", label: "Tudo Certo", color: "bg-emerald-500", bg: "from-emerald-900 to-emerald-700" };
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const formatCurrency = (v) => `R$ ${(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;

export default function ProjectClientView() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cashFlow, setCashFlow] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Project.get(id),
      base44.entities.Measurement.filter({ project_id: id }),
      base44.entities.Alert.filter({ related_id: id, is_resolved: false }),
      base44.entities.CashFlowEntry.filter({ project_id: id }),
    ]).then(([p, m, a, cf]) => {
      setProject(p);
      setMeasurements(m);
      setAlerts(a);
      setCashFlow(cf);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Carregando sua obra...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-slate-400">Obra não encontrada.</p>
    </div>
  );

  const health = getHealthInfo(project, alerts, cashFlow);
  const progress = project.progress_percent || 0;
  const approvedMeasurements = measurements.filter(m => m.status === "Aprovada");
  const totalApproved = approvedMeasurements.reduce((s, m) => s + (m.total_value || 0), 0);
  const cashIn = cashFlow.filter(c => c.type === "Receita").reduce((s, c) => s + (c.value || 0), 0);
  const cashOut = cashFlow.filter(c => c.type === "Despesa").reduce((s, c) => s + (c.value || 0), 0);
  const recentPhotos = measurements.filter(m => m.photos?.length > 0).flatMap(m => m.photos).slice(0, 6);

  const steps = [
    { done: true, label: "Obra iniciada" },
    { done: progress >= 25, label: "25% concluído" },
    { done: progress >= 50, label: "50% concluído" },
    { done: progress >= 75, label: "75% concluído" },
    { done: progress >= 100, label: "Entrega final" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-8">

      {/* Hero */}
      <div className={`bg-gradient-to-br ${health.bg} px-5 pt-12 pb-8 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className={`h-3 w-3 rounded-full ${health.color} animate-pulse`} />
            <span className="text-white/80 text-sm font-semibold">{health.label}</span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight">{project.name}</h1>
          {project.address && (
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="h-3.5 w-3.5 text-white/50" />
              <p className="text-white/60 text-sm">{project.address}</p>
            </div>
          )}

          {/* Big Progress */}
          <div className="mt-6">
            <div className="flex items-end justify-between mb-2">
              <p className="text-white/70 text-sm">Progresso da Obra</p>
              <p className="text-white text-3xl font-black">{progress}%</p>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-4">

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <Calendar className="h-5 w-5 text-slate-400 mb-2" />
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">Previsão de Entrega</p>
            <p className="text-white font-bold text-sm mt-1">{formatDate(project.expected_end_date)}</p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <DollarSign className="h-5 w-5 text-slate-400 mb-2" />
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">Orçamento</p>
            <p className="text-white font-bold text-sm mt-1">{formatCurrency(project.budget)}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-300 font-bold text-sm mb-4">Próximos Passos</p>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-emerald-500" : "bg-slate-800 border-2 border-slate-700"}`}>
                  {s.done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <div className="h-2 w-2 rounded-full bg-slate-600" />}
                </div>
                <p className={`text-sm font-semibold ${s.done ? "text-emerald-400" : "text-slate-500"}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
          <p className="text-slate-300 font-bold text-sm mb-4">Situação Financeira</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-slate-400 text-sm">Total investido</p>
              <p className="text-white font-bold">{formatCurrency(cashOut)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-slate-400 text-sm">Serviços medidos</p>
              <p className="text-emerald-400 font-bold">{formatCurrency(totalApproved)}</p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-3">
              <p className="text-slate-400 text-sm">Orçamento restante</p>
              <p className={`font-bold ${(project.budget || 0) - cashOut >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency((project.budget || 0) - cashOut)}
              </p>
            </div>
          </div>
        </div>

        {/* Photos */}
        {recentPhotos.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-300 font-bold text-sm">Fotos Recentes</p>
              <Camera className="h-4 w-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {recentPhotos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-slate-800">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Alerts for client */}
        {alerts.length > 0 && (
          <div className="bg-amber-950 rounded-2xl p-4 border border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <p className="text-amber-300 font-bold text-sm">Pontos de Atenção</p>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-start gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${a.severity === "Crítica" ? "bg-red-400" : "bg-amber-400"}`} />
                  <p className="text-amber-200/80 text-sm">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-slate-600 text-xs">Acompanhamento em tempo real por</p>
          <p className="text-slate-400 font-bold text-sm mt-1">Consuobra · Obra sob controle</p>
        </div>
      </div>
    </div>
  );
}
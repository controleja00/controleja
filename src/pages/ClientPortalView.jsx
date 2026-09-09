import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, MapPin, Calendar, CheckCircle2, Camera, FileText, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const STATUS_COLOR = {
  "Planejamento": "#778096",
  "Em andamento": "#435b89",
  "Atrasada": "#DC2626",
  "Concluída": "#059669",
  "Paralisada": "#D97706",
};

function ReportItem({ report }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #e1e5ed", background: "#FFFFFF" }}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
        <div>
          <p className="font-bold text-sm" style={{ color: "#172441" }}>{fmtDate(report.report_date)}</p>
          {report.phase && <p className="text-xs mt-0.5" style={{ color: "#778096" }}>{report.phase}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F0FDF4", color: "#059669" }}>Publicado</span>
          {open ? <ChevronUp className="h-4 w-4" style={{ color: "#778096" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#778096" }} />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1.5px solid #f6f8fc" }}>
          {report.photos?.filter(Boolean).length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-3">
              {report.photos.slice(0, 6).map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden block" style={{ background: "#f6f8fc" }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
          {report.observation && (
            <p className="text-sm leading-relaxed" style={{ color: "#424c62" }}>📌 {report.observation}</p>
          )}
          {report.ai_report && (
            <div className="rounded-xl p-3" style={{ background: "#f6f8fc" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#1f3258" }}>Resumo técnico</p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "#424c62" }}>{report.ai_report}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientPortalView() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, project: null, config: null, reports: [], error: null });

  useEffect(() => {
    (async () => {
      const configs = await base44.entities.ClientPortalConfig.filter({ access_token: token });
      const config = configs[0];
      if (!config || !config.active) { setState(s => ({ ...s, loading: false, error: "Portal inativo ou link inválido." })); return; }

      const [project, allReports] = await Promise.all([
        base44.entities.Project.get(config.project_id),
        base44.entities.DailyReport.filter({ project_id: config.project_id }),
      ]);

      const reports = allReports.filter(r => r.status === "Publicado").sort((a, b) => (b.report_date || "").localeCompare(a.report_date || ""));

      setState({ loading: false, project, config, reports, error: null });

      // Register access
      await base44.entities.ClientPortalConfig.update(config.id, { client_last_access: new Date().toISOString() }).catch(() => {});
    })();
  }, [token]);

  const { loading, project, config, reports, error } = state;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#f6f8fc" }}>
      <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ background: "#1f3258" }}>
        <Building2 className="h-6 w-6 text-white" />
      </div>
      <div className="h-5 w-5 rounded-full border-2 border-border border-t-blue-600 animate-spin" />
      <p className="text-sm font-medium" style={{ color: "#778096" }}>Carregando acompanhamento...</p>
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: "#f6f8fc" }}>
      <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: "#e1e5ed" }}>
        <Building2 className="h-7 w-7" style={{ color: "#778096" }} />
      </div>
      <p className="font-bold text-lg" style={{ color: "#172441" }}>Link inválido</p>
      <p className="text-sm" style={{ color: "#424c62" }}>{error || "Este link não existe ou foi revogado pelo responsável da obra."}</p>
    </div>
  );

  const progress = project.progress_percent || 0;
  const statusColor = STATUS_COLOR[project.status] || "#435b89";
  const lastUpdate = reports[0]?.report_date;
  const phases = project.phases || [];
  const nextPhases = phases.filter(p => (p.status || "") === "Pendente" || (p.executed_qty || 0) < (p.contracted_qty || 1));

  return (
    <div className="min-h-screen pb-12 font-sans" style={{ background: "#f6f8fc" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #1f3258 0%, #435b89 100%)" }} className="px-5 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)" }}>Acompanhamento da Obra</span>
        </div>

        <h1 className="text-2xl font-black text-white leading-tight mb-1">{project.name}</h1>
        {project.client && <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Cliente: {project.client}</p>}
        {project.address && (
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="h-3 w-3" style={{ color: "rgba(255,255,255,0.4)" }} />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{project.address}</p>
          </div>
        )}

        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
          <div className="h-2 w-2 rounded-full" style={{ background: statusColor === "#435b89" ? "#60A5FA" : statusColor }} />
          <span className="text-xs font-semibold text-white">{project.status}</span>
        </div>

        {config?.show_progress && (
          <div className="mt-6">
            <div className="flex items-end justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>PROGRESSO GERAL</p>
              <p className="text-3xl font-black text-white">{progress}%</p>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: progress >= 80 ? "#10B981" : progress >= 50 ? "#60A5FA" : "#8096bc" }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pt-5 space-y-4 max-w-2xl mx-auto">

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          {config?.show_deadline && project.expected_end_date && (
            <div className="rounded-2xl p-4 bg-white" style={{ border: "1.5px solid #e1e5ed" }}>
              <Calendar className="h-4 w-4 mb-2" style={{ color: "#778096" }} />
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#778096" }}>Previsão de entrega</p>
              <p className="text-sm font-bold" style={{ color: "#172441" }}>{fmtDate(project.expected_end_date)}</p>
            </div>
          )}
          {lastUpdate && (
            <div className="rounded-2xl p-4 bg-white" style={{ border: "1.5px solid #e1e5ed" }}>
              <Camera className="h-4 w-4 mb-2" style={{ color: "#778096" }} />
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: "#778096" }}>Última atualização</p>
              <p className="text-sm font-bold" style={{ color: "#172441" }}>{fmtDate(lastUpdate)}</p>
            </div>
          )}
        </div>

        {/* Next steps */}
        {config?.show_next_steps && nextPhases.length > 0 && (
          <div className="rounded-2xl bg-white p-5" style={{ border: "1.5px solid #e1e5ed" }}>
            <p className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "#172441" }}>
              <ArrowRight className="h-4 w-4" style={{ color: "#1f3258" }} />Próximos passos
            </p>
            <div className="space-y-3">
              {nextPhases.slice(0, 5).map((ph, i) => {
                const pct = ph.contracted_qty > 0 ? Math.round((ph.executed_qty || 0) / ph.contracted_qty * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black" style={{ background: pct >= 100 ? "#D1FAE5" : "#f6f8fc", color: pct >= 100 ? "#059669" : "#778096" }}>
                      {pct >= 100 ? <CheckCircle2 className="h-4 w-4" /> : `${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#172441" }}>{ph.name}</p>
                      {ph.contracted_qty > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#f6f8fc" }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 100 ? "#10B981" : "#1f3258" }} />
                          </div>
                          <span className="text-[10px] font-bold shrink-0" style={{ color: "#778096" }}>{pct}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent photos */}
        {config?.show_photos && reports.some(r => r.photos?.length > 0) && (
          <div className="rounded-2xl bg-white p-5" style={{ border: "1.5px solid #e1e5ed" }}>
            <p className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "#172441" }}>
              <Camera className="h-4 w-4" style={{ color: "#1f3258" }} />Fotos recentes
            </p>
            <div className="grid grid-cols-3 gap-2">
              {reports.flatMap(r => r.photos || []).slice(0, 9).map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden block" style={{ background: "#f6f8fc" }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Reports */}
        {config?.show_reports && reports.length > 0 && (
          <div>
            <p className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "#172441" }}>
              <FileText className="h-4 w-4" style={{ color: "#1f3258" }} />Relatórios de acompanhamento
            </p>
            <div className="space-y-3">
              {reports.map(r => <ReportItem key={r.id} report={r} />)}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs" style={{ color: "#778096" }}>As informações são atualizadas pela equipe responsável pela obra.</p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <div className="h-5 w-5 rounded-lg flex items-center justify-center" style={{ background: "#1f3258" }}>
              <Building2 className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-xs font-black" style={{ color: "#1f3258" }}>Consuobra</span>
            <span className="text-xs" style={{ color: "#e1e5ed" }}>·</span>
            <span className="text-xs" style={{ color: "#778096" }}>Obra sob controle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
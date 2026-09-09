import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search, Cpu, Archive, MoreVertical, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import PageHeader from "../components/PageHeader";
import ProjDeleteDialog from "../components/project/ProjDeleteDialog";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    base44.auth.me().then(me => {
      Promise.all([
        base44.entities.Project.filter({ created_by_id: me.id }),
        base44.entities.Alert.filter({ is_resolved: false, created_by_id: me.id }),
      ]).then(([p, a]) => { setProjects(p); setAlerts(a); setLoading(false); });
    });
  }, []);

  const visibleProjects = projects.filter(p => showArchived ? p.status === "Arquivada" : p.status !== "Arquivada");
  const filtered = visibleProjects.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.client?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const statusColor = {
    "Em andamento": "bg-blue-50 text-blue-700",
    "Atrasada": "bg-red-50 text-red-700",
    "Concluída": "bg-emerald-50 text-emerald-700",
    "Paralisada": "bg-gray-100 text-gray-700",
    "Planejamento": "bg-purple-50 text-purple-700",
  };

  const getHealth = (p) => {
    const projAlerts = alerts.filter(a => a.related_id === p.id);
    const criticals = projAlerts.filter(a => a.severity === "Crítica" || a.severity === "Alta").length;
    if (p.status === "Atrasada" || criticals >= 2) return { label: "Crítico", color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle };
    if (criticals >= 1 || projAlerts.length > 0) return { label: "Atenção", color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle };
    if (p.status === "Concluída") return { label: "Concluída", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 };
    return { label: "Saudável", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 };
  };

  return (
    <div>
      <PageHeader title="Obras" subtitle={`${visibleProjects.length} ${showArchived ? "arquivadas" : "ativas"}`}>
        <button onClick={() => setShowArchived(v => !v)} className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
          <Archive className="h-3.5 w-3.5" />{showArchived ? "Ver ativas" : "Arquivadas"}
        </button>
        <Link to="/projects/new"><Button><Plus className="h-4 w-4 mr-1.5" />Nova Obra</Button></Link>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar obra..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
              {/* Header bar */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.client}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[p.status] || "bg-gray-100 text-gray-700"}`}>{p.status}</span>
                    <button onClick={() => setDeleteTarget(p)} className="h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Progresso físico</span><span className="font-bold text-foreground">{p.progress_percent || 0}%</span>
                  </div>
                  <Progress value={p.progress_percent || 0} className="h-2" />
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Orçamento</p>
                    <p className="text-xs font-black">{p.budget ? `R$${(p.budget / 1000).toFixed(0)}k` : "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">Prazo</p>
                    <p className="text-xs font-black truncate">{p.expected_end_date ? new Date(p.expected_end_date).toLocaleDateString("pt-BR", { month: "short", day: "2-digit" }) : "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    {(() => { const h = getHealth(p); const HIcon = h.icon; return (<><p className="text-[10px] text-muted-foreground">Saúde</p><div className="flex items-center justify-center gap-1"><HIcon className={`h-3 w-3 ${h.color}`} /><p className={`text-[10px] font-black ${h.color}`}>{h.label}</p></div></>); })()}
                  </div>
                </div>

                {p.address && <p className="text-[11px] text-muted-foreground truncate mb-3">{p.address}</p>}
              </div>

              {/* Actions */}
              <div className="flex border-t border-border">
                <Link to={`/projects/${p.id}`} className="flex-1 text-center text-xs border-r border-border py-2.5 hover:bg-muted transition-colors font-medium">Editar</Link>
                <Link to={`/projects/${p.id}/central`} className="flex-[2] flex items-center justify-center gap-1.5 text-xs bg-primary text-primary-foreground py-2.5 hover:bg-primary/90 transition-colors font-bold">
                  <Cpu className="h-3.5 w-3.5" />Central da Obra
                </Link>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhuma obra encontrada</p>}
      </div>

      {deleteTarget && (
        <ProjDeleteDialog
          project={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={o => { if (!o) setDeleteTarget(null); }}
          onArchived={() => { setDeleteTarget(null); base44.auth.me().then(me => base44.entities.Project.filter({ created_by_id: me.id }).then(d => setProjects(d))); }}
        />
      )}
    </div>
  );
}
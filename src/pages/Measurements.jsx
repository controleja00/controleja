import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { approveMeasurement, rejectMeasurement } from "../utils/cascadeActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "../components/PageHeader";

export default function Measurements() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState({});

  const load = async () => {
    const me = await base44.auth.me();
    const [m, p] = await Promise.all([
      base44.entities.Measurement.filter({ created_by_id: me.id }, "-created_date"),
      base44.entities.Project.filter({ created_by_id: me.id }),
    ]);
    setItems(m); setProjects(p); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleApprove = async (m, e) => {
    e.stopPropagation();
    setActing(p => ({ ...p, [m.id]: "approving" }));
    await approveMeasurement(m, { projects, allMeasurements: items });
    await load();
    setActing(p => ({ ...p, [m.id]: null }));
  };

  const handleReject = async (m, e) => {
    e.stopPropagation();
    setActing(p => ({ ...p, [m.id]: "rejecting" }));
    await rejectMeasurement(m);
    await load();
    setActing(p => ({ ...p, [m.id]: null }));
  };

  const filtered = items.filter(m => m.service?.toLowerCase().includes(search.toLowerCase()) || m.project_name?.toLowerCase().includes(search.toLowerCase()) || m.subcontractor_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const statusColor = { "Pendente": "bg-amber-50 text-amber-700", "Aprovada": "bg-emerald-50 text-emerald-700", "Rejeitada": "bg-red-50 text-red-700", "Em revisão": "bg-secondary text-primary" };

  return (
    <div>
      <PageHeader title="Medições" subtitle={`${items.length} medições`}>
        <Link to="/measurements/new"><Button><Plus className="h-4 w-4 mr-1.5" />Nova Medição</Button></Link>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar medição..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Serviço</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Obra</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Subempreiteiro</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => window.location.href = `/measurements/${m.id}`}>
                    <td className="px-4 py-3 font-medium">{m.service}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{m.project_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.subcontractor_name}</td>
                    <td className="px-4 py-3 text-right font-medium">R$ {(m.total_value || 0).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-center"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[m.status] || ""}`}>{m.status}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {m.status === "Pendente" && (
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={(e) => handleReject(m, e)} disabled={!!acting[m.id]} className="h-7 w-7 flex items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50">
                            {acting[m.id] === "rejecting" ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          </button>
                          <button onClick={(e) => handleApprove(m, e)} disabled={!!acting[m.id]} className="h-7 px-2.5 flex items-center gap-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50">
                            {acting[m.id] === "approving" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Aprovar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhuma medição encontrada</p>}
        </div>
      </div>
    </div>
  );
}
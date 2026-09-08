import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "../components/PageHeader";
import ScoreBadge from "../components/ScoreBadge";

export default function Subcontractors() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.auth.me().then(me => base44.entities.Subcontractor.filter({ created_by_id: me.id }).then(d => { setSubs(d); setLoading(false); }));
  }, []);

  const filtered = subs.filter(s =>
    s.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.specialty?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Subempreiteiros" subtitle={`${subs.length} cadastrados`}>
        <Link to="/subcontractors/new"><Button><Plus className="h-4 w-4 mr-1.5" />Novo</Button></Link>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <Link key={s.id} to={`/subcontractors/${s.id}`} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-start gap-3">
                <ScoreBadge score={s.score_total} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{s.company_name}</p>
                  <p className="text-xs text-muted-foreground">{s.specialty}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.status === "Ativo" ? "bg-emerald-50 text-emerald-700" : s.status === "Bloqueado" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{s.status}</span>
                {s.city && <span className="text-[10px] text-muted-foreground">{s.city}, {s.state}</span>}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{s.contact_name} · {s.phone || "Sem telefone"}</div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhum subempreiteiro encontrado</p>}
      </div>
    </div>
  );
}
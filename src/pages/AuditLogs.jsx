import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Search, Shield } from "lucide-react";
import PageHeader from "../components/PageHeader";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.auth.me().then((me) => base44.entities.AuditLog.filter({ created_by_id: me.id }, "-created_date", 100))
      .then(d => { setLogs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const riskColor = { "Baixo": "bg-emerald-50 text-emerald-700", "Médio": "bg-amber-50 text-amber-700", "Alto": "bg-orange-50 text-orange-700", "Crítico": "bg-red-50 text-red-700" };

  return (
    <div>
      <PageHeader title="Logs de Auditoria" subtitle="Rastreabilidade completa de todas as ações na plataforma" />
      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar ação, entidade, usuário..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Shield className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhum log de auditoria registrado ainda</p>
              <p className="text-xs text-muted-foreground">As ações na plataforma serão registradas automaticamente aqui</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ação</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Entidade</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Usuário</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Data</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Risco</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(l => (
                    <tr key={l.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{l.action}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{l.entity_type} {l.entity_name ? `· ${l.entity_name}` : ""}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{l.user_email || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">{new Date(l.created_date).toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 text-center"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${riskColor[l.risk_level] || "bg-gray-100 text-gray-700"}`}>{l.risk_level || "Baixo"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

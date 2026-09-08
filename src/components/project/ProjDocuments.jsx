import { FileText, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const statusColor = {
  "Aprovado": "bg-emerald-50 text-emerald-700",
  "Pendente": "bg-amber-50 text-amber-700",
  "Vencido": "bg-red-50 text-red-700",
  "Reprovado": "bg-red-50 text-red-700",
};

export default function ProjDocuments({ documents, subs }) {
  const expired = documents.filter(d => d.status === "Vencido");
  const approved = documents.filter(d => d.status === "Aprovado");
  const pending = documents.filter(d => d.status === "Pendente");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aprovados", count: approved.length, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Pendentes", count: pending.length, icon: Clock, color: "text-amber-600" },
          { label: "Vencidos", count: expired.length, icon: AlertTriangle, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`h-6 w-6 ${s.color}`} />
            <div><p className={`text-2xl font-bold ${s.color}`}>{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      {expired.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" />Documentos Vencidos — Ação Necessária</p>
          <ul className="space-y-1">{expired.map(d => (
            <li key={d.id} className="text-xs text-red-700">• {d.type} — {d.subcontractor_name}</li>
          ))}</ul>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Nenhum documento vinculado a esta obra</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Empreiteiro</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Vencimento</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {documents.map(d => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{d.type}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{d.subcontractor_name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{d.expiry_date || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[d.status] || "bg-gray-100 text-gray-600"}`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
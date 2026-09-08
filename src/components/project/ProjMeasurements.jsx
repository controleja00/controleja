import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Clock, XCircle, Image } from "lucide-react";

const statusColor = {
  "Aprovada": "bg-emerald-50 text-emerald-700",
  "Pendente": "bg-amber-50 text-amber-700",
  "Rejeitada": "bg-red-50 text-red-700",
  "Em revisão": "bg-blue-50 text-blue-700",
};

export default function ProjMeasurements({ measurements, project, onRefresh, modalOpen, setModalOpen }) {
  const setIsOpen = setModalOpen;

  const stats = [
    { label: "Aprovadas", count: measurements.filter(m => m.status === "Aprovada").length, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Pendentes", count: measurements.filter(m => m.status === "Pendente").length, icon: Clock, color: "text-amber-600" },
    { label: "Rejeitadas", count: measurements.filter(m => m.status === "Rejeitada").length, icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`h-6 w-6 ${s.color}`} />
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          style={{ pointerEvents: "auto", position: "relative", zIndex: 10 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen && setIsOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />Nova Medição
        </Button>
      </div>

      {measurements.length === 0 ? (
        <div className="bg-card border border-border rounded-xl flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Nenhuma medição registrada nesta obra</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Serviço</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Empreiteiro</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Fotos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {measurements.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{m.service}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{m.subcontractor_name || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">R$ {(m.total_value || 0).toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[m.status] || "bg-gray-100 text-gray-600"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m.photos?.length > 0
                        ? <span className="flex items-center justify-center gap-1 text-xs text-primary"><Image className="h-3 w-3" />{m.photos.length}</span>
                        : <span className="text-muted-foreground text-xs">—</span>
                      }
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
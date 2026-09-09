import { AlertTriangle, DollarSign, Ruler, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
  } catch {
    return "";
  }
};

export default function SmartFeed({ measurements, alerts, cashFlow }) {
  const events = [
    ...measurements.slice(0, 10).map(m => ({
      id: m.id,
      type: "measurement",
      icon: Ruler,
      iconBg: m.status === "Aprovada" ? "bg-emerald-100" : m.status === "Rejeitada" ? "bg-red-100" : "bg-amber-100",
      iconColor: m.status === "Aprovada" ? "text-emerald-600" : m.status === "Rejeitada" ? "text-red-600" : "text-amber-600",
      title: m.status === "Aprovada" ? `Medição aprovada` : m.status === "Rejeitada" ? `Medição rejeitada` : `Nova medição`,
      subtitle: `${m.service} · ${m.project_name || ""}${m.total_value ? ` · R$ ${m.total_value.toLocaleString("pt-BR")}` : ""}`,
      time: m.created_date,
      link: `/measurements/${m.id}`,
    })),
    ...alerts.slice(0, 5).map(a => ({
      id: a.id,
      type: "alert",
      icon: AlertTriangle,
      iconBg: a.severity === "Crítica" ? "bg-red-100" : a.severity === "Alta" ? "bg-orange-100" : "bg-amber-100",
      iconColor: a.severity === "Crítica" ? "text-red-600" : a.severity === "Alta" ? "text-orange-600" : "text-amber-600",
      title: a.title,
      subtitle: `${a.type} · ${a.severity}`,
      time: a.created_date,
      link: "/alerts",
    })),
    ...cashFlow.filter(c => c.status === "Pago").slice(0, 5).map(c => ({
      id: c.id,
      type: "payment",
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      title: `Pagamento realizado`,
      subtitle: `${c.description}${c.value ? ` · R$ ${c.value.toLocaleString("pt-BR")}` : ""}`,
      time: c.paid_date || c.created_date,
      link: "/cash-flow",
    })),
    ...cashFlow.filter(c => c.status === "Atrasado").slice(0, 3).map(c => ({
      id: c.id + "_late",
      type: "overdue",
      icon: Clock,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: `Pagamento atrasado`,
      subtitle: `${c.description}${c.value ? ` · R$ ${c.value.toLocaleString("pt-BR")}` : ""}`,
      time: c.due_date,
      link: "/cash-flow",
    })),
  ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 10);

  if (events.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-bold text-sm">Feed da Operação</h2>
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <div className="divide-y divide-border">
        {events.map(e => (
          <Link key={e.id} to={e.link} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
            <div className={`h-8 w-8 rounded-xl ${e.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
              <e.icon className={`h-4 w-4 ${e.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{e.title}</p>
              <p className="text-xs text-muted-foreground truncate">{e.subtitle}</p>
            </div>
            {e.time && (
              <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{timeAgo(e.time)}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
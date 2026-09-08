import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: Icon, color = "primary", subtitle }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center shrink-0", colorMap[color] || colorMap.primary)}>
        {Icon && <Icon className="h-5 w-5" />}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
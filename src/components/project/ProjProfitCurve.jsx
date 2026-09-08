/**
 * ProjProfitCurve — Curva de Lucro da Obra
 * Mostra receita, custo previsto, custo projetado, lucro e margem.
 */
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Target, BarChart3 } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (v) => {
  if (!v && v !== 0) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1000000) return `${sign}R$${(abs / 1000000).toFixed(2)}M`;
  if (abs >= 1000) return `${sign}R$${(abs / 1000).toFixed(0)}k`;
  return `${sign}R$${abs.toLocaleString("pt-BR")}`;
};

function Row({ label, value, color = "text-foreground", sub }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
      <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  );
}

export default function ProjProfitCurve({ project, measurements }) {
  const contracted = project.contracted_value || 0;
  const budget = project.budget || 0;
  const physProgress = project.progress_percent || 0;

  const approved = measurements.filter(m => m.status === "Aprovada");
  const totalMeasured = approved.reduce((s, m) => s + (m.total_value || 0), 0);

  // Projected cost: extrapolate based on physical progress
  const projectedCost = physProgress > 0 ? Math.round((totalMeasured / physProgress) * 100) : budget;
  const projectedProfit = contracted - projectedCost;
  const projectedMargin = contracted > 0 ? ((projectedProfit / contracted) * 100).toFixed(1) : 0;

  const plannedProfit = contracted - budget;
  const plannedMargin = contracted > 0 ? ((plannedProfit / contracted) * 100).toFixed(1) : 0;

  const profitDelta = projectedProfit - plannedProfit;
  const isMarginalShrink = Number(projectedMargin) < Number(plannedMargin) - 2;

  const chartData = [
    { name: "Receita", value: contracted, fill: "#3b82f6" },
    { name: "Custo Previsto", value: budget, fill: "#94a3b8" },
    { name: "Custo Projetado", value: projectedCost, fill: projectedCost > budget ? "#ef4444" : "#10b981" },
    { name: "Lucro Previsto", value: plannedProfit, fill: plannedProfit >= 0 ? "#10b981" : "#ef4444" },
    { name: "Lucro Projetado", value: projectedProfit, fill: projectedProfit >= 0 ? "#059669" : "#dc2626" },
  ];

  return (
    <div className="space-y-4">
      {/* Alert if margin is shrinking */}
      {isMarginalShrink && contracted > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-semibold">
            A margem caiu de {plannedMargin}% para {projectedMargin}%. Se continuar assim, o lucro final será{" "}
            R$ {Math.abs(profitDelta).toLocaleString("pt-BR")} {profitDelta < 0 ? "menor" : "maior"} que o previsto.
          </p>
        </div>
      )}

      {/* Summary card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">Análise de Rentabilidade</h3>
        </div>
        <div className="px-4 py-2">
          <Row label="Receita Contratada" value={fmt(contracted)} color="text-primary" />
          <Row label="Custo Previsto (Orçamento)" value={fmt(budget)} />
          <Row
            label="Custo Projetado"
            value={fmt(projectedCost)}
            color={projectedCost > budget ? "text-red-600" : "text-emerald-600"}
            sub={projectedCost > budget ? `+${fmt(projectedCost - budget)} acima do previsto` : "dentro do orçamento"}
          />
          <Row
            label="Lucro Previsto"
            value={fmt(plannedProfit)}
            color={plannedProfit >= 0 ? "text-emerald-600" : "text-red-600"}
            sub={`Margem planejada: ${plannedMargin}%`}
          />
          <Row
            label="Lucro Projetado"
            value={fmt(projectedProfit)}
            color={projectedProfit >= 0 ? "text-emerald-700" : "text-red-700"}
            sub={`Margem projetada: ${projectedMargin}%`}
          />
        </div>
      </div>

      {/* Chart */}
      {contracted > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-4">Comparativo Visual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(v) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <ReferenceLine x={0} stroke="hsl(var(--border))" />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Execution progress vs budget */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-bold">Execução vs Orçamento</h3>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Executado ({physProgress}%)</span>
            <span className="font-bold">{fmt(totalMeasured)}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${physProgress}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Custo projetado vs receita</span>
            <span className={`font-bold ${projectedCost > contracted ? "text-red-600" : "text-emerald-600"}`}>
              {budget > 0 ? `${Math.round((projectedCost / contracted) * 100)}%` : "—"}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full ${projectedCost > budget ? "bg-red-400" : "bg-emerald-500"}`}
              style={{ width: `${contracted > 0 ? Math.min(100, (projectedCost / contracted) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
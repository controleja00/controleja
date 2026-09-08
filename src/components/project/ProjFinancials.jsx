import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, CheckCircle2, Clock,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

const fmt = (v) => {
  if (v >= 1000000) return `R$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
  return `R$${(v || 0).toLocaleString("pt-BR")}`;
};

function MetricCard({ label, value, sub, color, icon: Icon, highlight }) {
  return (
    <div className={cn("rounded-2xl p-4 border", highlight ? "bg-primary text-white border-primary" : "bg-card border-border")}>
      <div className="flex items-center justify-between mb-2">
        <p className={cn("text-xs font-semibold", highlight ? "text-white/70" : "text-muted-foreground")}>{label}</p>
        {Icon && <Icon className={cn("h-4 w-4", highlight ? "text-white/60" : color)} />}
      </div>
      <p className={cn("text-2xl font-black", highlight ? "text-white" : color)}>{value}</p>
      {sub && <p className={cn("text-[10px] mt-0.5", highlight ? "text-white/60" : "text-muted-foreground")}>{sub}</p>}
    </div>
  );
}

export default function ProjFinancials({ project, measurements }) {
  const [cashFlow, setCashFlow] = useState([]);
  const [loadingCF, setLoadingCF] = useState(true);

  useEffect(() => {
    base44.entities.CashFlowEntry.filter({ project_id: project.id })
      .then(data => { setCashFlow(data); setLoadingCF(false); });
  }, [project.id]);

  // --- Core financial calculations ---
  const budget = project.budget || 0;
  const contractedValue = project.contracted_value || project.budget || 0;
  const initialCapital = project.initial_capital || 0;

  const approvedMeasurements = measurements.filter(m => m.status === "Aprovada");
  const pendingMeasurements = measurements.filter(m => m.status === "Pendente");
  const totalMeasured = approvedMeasurements.reduce((s, m) => s + (m.total_value || 0), 0);
  const totalPending = pendingMeasurements.reduce((s, m) => s + (m.total_value || 0), 0);

  // Cash flow calculations
  const entradas = cashFlow.filter(e => e.type === "Receita");
  const saidas = cashFlow.filter(e => e.type === "Despesa");
  const entradasRecebidas = entradas.filter(e => e.status === "Pago").reduce((s, e) => s + (e.value || 0), 0);
  const entradasPrevistas = entradas.filter(e => e.status !== "Pago" && e.status !== "Cancelado").reduce((s, e) => s + (e.value || 0), 0);
  const saidasPagas = saidas.filter(e => e.status === "Pago").reduce((s, e) => s + (e.value || 0), 0);
  const saidasPrevistas = saidas.filter(e => e.status !== "Pago" && e.status !== "Cancelado").reduce((s, e) => s + (e.value || 0), 0);
  const aVencer = cashFlow.filter(e => (e.status === "A pagar" || e.status === "Atrasado") && e.type === "Despesa");
  const atrasados = cashFlow.filter(e => e.status === "Atrasado");

  // Saldo real = capital inicial + entradas recebidas - saídas pagas
  const saldoReal = initialCapital + entradasRecebidas - saidasPagas;
  // Capital disponível = saldo real - compromissos futuros
  const capitalDisponivel = saldoReal - saidasPrevistas;

  // Lucro
  const custoPrevisto = budget;
  const lucroprevisto = contractedValue - custoPrevisto;
  const lucroReal = entradasRecebidas - saidasPagas;
  const margemPrevista = contractedValue > 0 ? ((lucroprevisto / contractedValue) * 100).toFixed(1) : 0;
  const margemReal = entradasRecebidas > 0 ? ((lucroReal / entradasRecebidas) * 100).toFixed(1) : 0;

  // Progresso financeiro
  const finProgress = contractedValue > 0 ? Math.min(100, Math.round((totalMeasured / contractedValue) * 100)) : 0;

  // Risk flag: financial ahead of physical
  const physProgress = project.progress_percent || 0;
  const financialRisk = saidasPagas > contractedValue * 0.8 && physProgress < 70;
  const overdraftRisk = capitalDisponivel < 0;

  // Chart: cash flow by month
  const byMonth = {};
  cashFlow.filter(e => e.due_date).forEach(e => {
    const key = e.due_date.substring(0, 7);
    if (!byMonth[key]) byMonth[key] = { month: key.replace("-", "/"), entrada: 0, saida: 0 };
    if (e.type === "Receita") byMonth[key].entrada += e.value || 0;
    else byMonth[key].saida += e.value || 0;
  });
  const chartData = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

  if (loadingCF) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Risk alerts */}
      {(financialRisk || overdraftRisk || atrasados.length > 0) && (
        <div className="space-y-2">
          {overdraftRisk && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-semibold">Capital disponível negativo. Risco de não cumprir compromissos futuros.</p>
            </div>
          )}
          {financialRisk && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-semibold">Obra consumiu {Math.round((saidasPagas / contractedValue) * 100)}% do valor contratado, mas progresso físico é só {physProgress}%. Risco de estouro.</p>
            </div>
          )}
          {atrasados.length > 0 && (
            <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
              <Clock className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700 font-semibold">{atrasados.length} pagamento(s) atrasado(s) · R$ {atrasados.reduce((s, e) => s + (e.value || 0), 0).toLocaleString("pt-BR")}</p>
            </div>
          )}
        </div>
      )}

      {/* Main KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Saldo Real" value={fmt(saldoReal)} sub={`Cap. inicial: ${fmt(initialCapital)}`} color={saldoReal >= 0 ? "text-emerald-600" : "text-red-600"} icon={DollarSign} highlight={saldoReal >= 0} />
        <MetricCard label="Capital Disponível" value={fmt(capitalDisponivel)} sub={`Após compromissos`} color={capitalDisponivel >= 0 ? "text-blue-600" : "text-red-600"} icon={capitalDisponivel >= 0 ? TrendingUp : TrendingDown} />
        <MetricCard label="Lucro Real" value={fmt(lucroReal)} sub={`Margem: ${margemReal}%`} color={lucroReal >= 0 ? "text-emerald-600" : "text-red-600"} icon={TrendingUp} />
        <MetricCard label="Lucro Previsto" value={fmt(lucroprevisto)} sub={`Margem: ${margemPrevista}%`} color="text-primary" icon={TrendingUp} />
      </div>

      {/* Financial progress bar */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">Valor Contratado: {fmt(contractedValue)}</p>
          <span className="text-xs font-black text-primary">{finProgress}% medido</span>
        </div>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Medições aprovadas</span><span>{fmt(totalMeasured)}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${Math.min(100, contractedValue > 0 ? (totalMeasured / contractedValue) * 100 : 0)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Custo pago</span><span>{fmt(saidasPagas)}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-red-400 rounded-full" style={{ width: `${Math.min(100, budget > 0 ? (saidasPagas / budget) * 100 : 0)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Progresso físico</span><span>{physProgress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${physProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            <p className="text-xs font-bold text-emerald-800">Entradas</p>
          </div>
          <p className="text-xs text-emerald-700">Recebidas: <strong>{fmt(entradasRecebidas)}</strong></p>
          <p className="text-xs text-emerald-600">Previstas: {fmt(entradasPrevistas)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowDownRight className="h-4 w-4 text-red-600" />
            <p className="text-xs font-bold text-red-800">Saídas</p>
          </div>
          <p className="text-xs text-red-700">Pagas: <strong>{fmt(saidasPagas)}</strong></p>
          <p className="text-xs text-red-600">Previstas: {fmt(saidasPrevistas)}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3 className="font-bold text-sm mb-3">Fluxo de Caixa por Período</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 9 }} />
              <Tooltip formatter={(v, n) => [`R$ ${v.toLocaleString("pt-BR")}`, n === "entrada" ? "Entrada" : "Saída"]} />
              <Bar dataKey="entrada" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="saida" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pending approvals */}
      {pendingMeasurements.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-amber-50">
            <p className="text-sm font-bold text-amber-800">Medições aguardando aprovação</p>
          </div>
          <div className="divide-y divide-border">
            {pendingMeasurements.map(m => (
              <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{m.service}</p>
                  <p className="text-xs text-muted-foreground">{m.subcontractor_name}</p>
                </div>
                <p className="text-sm font-bold text-amber-600">R$ {(m.total_value || 0).toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* A pagar */}
      {aVencer.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-bold">{aVencer.length} pagamentos pendentes</p>
          </div>
          <div className="divide-y divide-border">
            {aVencer.slice(0, 5).map(e => (
              <div key={e.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{e.description}</p>
                  <p className="text-xs text-muted-foreground">{e.due_date || "Sem venc."}</p>
                </div>
                <span className={cn("text-sm font-bold", e.status === "Atrasado" ? "text-red-600" : "text-amber-600")}>
                  R$ {(e.value || 0).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-border">
            <Link to="/cash-flow" className="text-xs text-primary font-semibold hover:underline">Ver todos no Fluxo de Caixa →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
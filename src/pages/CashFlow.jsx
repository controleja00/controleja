import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign, CheckCircle2, Loader2, ArrowUpRight, ArrowDownRight, CalendarClock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import PageHeader from "../components/PageHeader";

const CATEGORIES_DESPESA = ["Medição", "Pagamento empreiteiro", "Funcionário", "Material", "Equipamento", "Combustível", "Transporte", "Aluguel", "Impostos", "Documentação", "Manutenção", "Administrativo", "Outro"];
const CATEGORIES_RECEITA = ["Pagamento do cliente", "Adiantamento", "Medição recebida", "Reembolso", "Venda de material", "Outro"];

const palette = {
  ink: "#172441",
  navy: "#1f3258",
  steel: "#8096bc",
  silver: "#b9bdc8",
  soft: "#e7ebf4",
  canvas: "#f6f8fc",
  line: "#e1e5ed",
  text: "#424c62",
  muted: "#778096",
};

const statusStyle = {
  Previsto: { bg: "#e7ebf4", text: palette.navy },
  "A pagar": { bg: "#d6ddea", text: palette.navy },
  Pago: { bg: "#edf2f8", text: palette.navy },
  Atrasado: { bg: "#fff1f2", text: "#9f1239" },
  Cancelado: { bg: "#f3f4f6", text: "#4b5563" },
};

const money = (value) => `R$ ${(value || 0).toLocaleString("pt-BR")}`;
const compactMoney = (value) => {
  const abs = Math.abs(value || 0);
  if (abs >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return money(value);
};

function Loading() {
  return (
    <div className="flex h-96 items-center justify-center" style={{ background: palette.canvas }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: palette.line, borderTopColor: palette.navy }} />
    </div>
  );
}

function BaixaDialog({ entry, onDone }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    await base44.entities.CashFlowEntry.update(entry.id, {
      status: "Pago",
      paid_date: date,
    });
    setSaving(false);
    setOpen(false);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 text-xs">Dar baixa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Confirmar baixa</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border p-3" style={{ background: palette.soft, borderColor: palette.line }}>
            <p className="text-sm font-black" style={{ color: palette.ink }}>{entry.description}</p>
            <p className="text-xs" style={{ color: palette.muted }}>{entry.project_name} · {money(entry.value)}</p>
          </div>
          <div>
            <Label>Data de {entry.type === "Receita" ? "recebimento" : "pagamento"}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={confirm} disabled={saving} className="w-full">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Confirmando...</> : <><CheckCircle2 className="h-4 w-4" />Confirmar baixa</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({ label, value, helper, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: tone, borderColor: "rgba(23,36,65,0.08)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
          <Icon className="h-5 w-5" style={{ color: palette.navy }} />
        </div>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.muted }}>{label}</p>
      <p className="mt-1 text-2xl font-black" style={{ color: palette.ink }}>{value}</p>
      <p className="mt-1 text-xs" style={{ color: palette.text }}>{helper}</p>
    </div>
  );
}

export default function CashFlow() {
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterProject, setFilterProject] = useState("all");
  const [form, setForm] = useState({ project_id: "", description: "", type: "Despesa", category: "", value: "", due_date: "", status: "A pagar", notes: "" });

  const load = () => base44.auth.me().then((me) => Promise.all([
    base44.entities.CashFlowEntry.filter({ created_by_id: me.id }, "-due_date", 200),
    base44.entities.Project.filter({ created_by_id: me.id }),
  ]).then(([e, p]) => {
    setEntries(e);
    setProjects(p);
    setLoading(false);
  }));

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    const project = projects.find((p) => p.id === form.project_id);
    await base44.entities.CashFlowEntry.create({
      ...form,
      project_name: project?.name || "",
      value: Number(form.value) || 0,
    });
    setSaving(false);
    setOpen(false);
    setForm({ project_id: "", description: "", type: "Despesa", category: "", value: "", due_date: "", status: "A pagar", notes: "" });
    load();
  };

  if (loading) return <Loading />;

  const filtered = filterProject === "all" ? entries : entries.filter((entry) => entry.project_id === filterProject);
  const receitas = filtered.filter((entry) => entry.type === "Receita").reduce((s, entry) => s + (entry.value || 0), 0);
  const despesas = filtered.filter((entry) => entry.type === "Despesa").reduce((s, entry) => s + (entry.value || 0), 0);
  const saldo = receitas - despesas;
  const aVencer = filtered.filter((entry) => entry.status === "A pagar" || entry.status === "Atrasado");
  const atrasados = filtered.filter((entry) => entry.status === "Atrasado");

  const byMonth = {};
  filtered.forEach((entry) => {
    const key = entry.due_date?.substring(0, 7) || "S/D";
    if (!byMonth[key]) byMonth[key] = { month: key.replace("-", "/"), receita: 0, despesa: 0 };
    if (entry.type === "Receita") byMonth[key].receita += entry.value || 0;
    else byMonth[key].despesa += entry.value || 0;
  });
  const chartData = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="min-h-screen" style={{ background: palette.canvas }}>
      <PageHeader title="Gastos e caixa" subtitle="Receitas, despesas, vencimentos e saldo por obra.">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" />Novo lançamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Obra</Label>
                <Select value={form.project_id} onValueChange={(v) => set("project_id", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                  <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ex: compra de cimento, medição recebida..." className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => { set("type", v); set("category", ""); }}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Receita">Receita</SelectItem><SelectItem value="Despesa">Despesa</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>{(form.type === "Receita" ? CATEGORIES_RECEITA : CATEGORIES_DESPESA).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Valor (R$)</Label><Input type="number" value={form.value} onChange={(e) => set("value", e.target.value)} className="mt-1.5" /></div>
                <div><Label>Vencimento</Label><Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className="mt-1.5" /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Previsto", "A pagar", "Pago", "Atrasado"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={save} disabled={saving || !form.project_id || !form.description || !form.value} className="w-full">
                {saving ? "Salvando..." : "Salvar lançamento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="space-y-5 p-4 sm:p-6">
        <section className="rounded-2xl border bg-white p-3" style={{ borderColor: palette.line }}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilterProject("all")} className="shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition-colors" style={{ background: filterProject === "all" ? palette.navy : "#ffffff", color: filterProject === "all" ? "#ffffff" : palette.navy, borderColor: palette.navy }}>
              Todas as obras
            </button>
            {projects.map((p) => (
              <button key={p.id} onClick={() => setFilterProject(p.id)} className="shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition-colors" style={{ background: filterProject === p.id ? palette.navy : "#ffffff", color: filterProject === p.id ? "#ffffff" : palette.text, borderColor: filterProject === p.id ? palette.navy : palette.line }}>
                {p.name}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="Receitas" value={compactMoney(receitas)} helper="entradas registradas" icon={TrendingUp} tone="#e7ebf4" />
          <SummaryCard label="Despesas" value={compactMoney(despesas)} helper="saídas registradas" icon={TrendingDown} tone="#d6ddea" />
          <SummaryCard label="Saldo" value={compactMoney(saldo)} helper={saldo >= 0 ? "posição positiva" : "atenção ao caixa"} icon={DollarSign} tone="#eef2f8" />
          <SummaryCard label="A vencer" value={aVencer.length} helper={`${atrasados.length} em atraso`} icon={CalendarClock} tone="#f1f3f7" />
        </div>

        {chartData.length > 0 && (
          <section className="rounded-2xl border bg-white p-5" style={{ borderColor: palette.line }}>
            <div className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Visão por período</p>
              <h2 className="text-lg font-black" style={{ color: palette.ink }}>Movimento financeiro</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="24%">
                <CartesianGrid strokeDasharray="3 3" stroke={palette.line} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: palette.muted }} />
                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: palette.muted }} />
                <Tooltip formatter={(v, n) => [money(v), n === "receita" ? "Receita" : "Despesa"]} />
                <ReferenceLine y={0} stroke={palette.line} />
                <Bar dataKey="receita" fill={palette.steel} radius={[5, 5, 0, 0]} />
                <Bar dataKey="despesa" fill={palette.navy} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        <Tabs defaultValue="pendente">
          <TabsList>
            <TabsTrigger value="pendente">Pendências</TabsTrigger>
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>

          <TabsContent value="pendente">
            <section className="mt-3 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: palette.line }}>
              {aVencer.length === 0 ? (
                <p className="py-10 text-center text-sm" style={{ color: palette.muted }}>Nenhum lançamento pendente.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: palette.line }}>
                  {aVencer.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3" style={{ background: entry.status === "Atrasado" ? "#fff1f2" : "#ffffff" }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: entry.type === "Receita" ? palette.soft : "#d6ddea" }}>
                        {entry.type === "Receita" ? <ArrowUpRight className="h-5 w-5" style={{ color: palette.navy }} /> : <ArrowDownRight className="h-5 w-5" style={{ color: palette.navy }} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black" style={{ color: palette.ink }}>{entry.description}</p>
                        <p className="text-xs" style={{ color: palette.muted }}>{entry.project_name} · Venc: {entry.due_date || "sem data"}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black" style={{ color: entry.status === "Atrasado" ? "#9f1239" : palette.navy }}>{money(entry.value)}</p>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: statusStyle[entry.status]?.bg || palette.soft, color: statusStyle[entry.status]?.text || palette.navy }}>{entry.status}</span>
                      </div>
                      <BaixaDialog entry={entry} onDone={load} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="todos">
            <section className="mt-3 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: palette.line }}>
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm" style={{ color: palette.muted }}>Nenhum lançamento cadastrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "#eef2f8", borderBottom: `1px solid ${palette.line}` }}>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Descrição</th>
                        <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-widest sm:table-cell" style={{ color: palette.muted }}>Categoria</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Valor</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Tipo</th>
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: palette.line }}>
                      {filtered.slice(0, 50).map((entry) => (
                        <tr key={entry.id} className="transition-colors hover:bg-[#f6f8fc]">
                          <td className="px-4 py-3 font-black" style={{ color: palette.ink }}>{entry.description}<p className="text-[10px] font-medium" style={{ color: palette.muted }}>{entry.project_name}</p></td>
                          <td className="hidden px-4 py-3 text-xs sm:table-cell" style={{ color: palette.text }}>{entry.category}</td>
                          <td className="px-4 py-3 text-right font-black" style={{ color: palette.navy }}>{money(entry.value)}</td>
                          <td className="px-4 py-3 text-center"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: entry.type === "Receita" ? palette.soft : "#d6ddea", color: palette.navy }}>{entry.type}</span></td>
                          <td className="px-4 py-3 text-center"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: statusStyle[entry.status]?.bg || palette.soft, color: statusStyle[entry.status]?.text || palette.navy }}>{entry.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

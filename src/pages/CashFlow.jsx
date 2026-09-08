import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle2, Clock, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import PageHeader from "../components/PageHeader";
import { cn } from "@/lib/utils";

const CATEGORIES_DESPESA = ["Medição", "Pagamento empreiteiro", "Funcionário", "Material", "Equipamento", "Combustível", "Transporte", "Aluguel", "Impostos", "Documentação", "Manutenção", "Administrativo", "Outro"];
const CATEGORIES_RECEITA = ["Pagamento do cliente", "Adiantamento", "Medição recebida", "Reembolso", "Venda de material", "Outro"];

const statusColor = {
  "Previsto": "bg-blue-50 text-blue-700",
  "A pagar": "bg-amber-50 text-amber-700",
  "Pago": "bg-emerald-50 text-emerald-700",
  "Atrasado": "bg-red-50 text-red-700",
  "Cancelado": "bg-gray-100 text-gray-600",
};

function BaixaDialog({ entry, onDone }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    await base44.entities.CashFlowEntry.update(entry.id, {
      status: entry.type === "Receita" ? "Pago" : "Pago",
      paid_date: date,
    });
    setSaving(false);
    setOpen(false);
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0">
          Dar Baixa
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Confirmar Baixa</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-sm font-bold">{entry.description}</p>
            <p className="text-xs text-muted-foreground">{entry.project_name} · R$ {(entry.value || 0).toLocaleString("pt-BR")}</p>
          </div>
          <div>
            <Label>Data de {entry.type === "Receita" ? "recebimento" : "pagamento"}</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
          </div>
          <Button onClick={confirm} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Confirmando...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Confirmar Baixa</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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

  const load = () => base44.auth.me().then(me => Promise.all([
    base44.entities.CashFlowEntry.filter({ created_by_id: me.id }, "-due_date", 200),
    base44.entities.Project.filter({ created_by_id: me.id }),
  ]).then(([e, p]) => { setEntries(e); setProjects(p); setLoading(false); }));

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const project = projects.find(p => p.id === form.project_id);
    await base44.entities.CashFlowEntry.create({
      ...form,
      project_name: project?.name || "",
      value: Number(form.value) || 0
    });
    setSaving(false);
    setOpen(false);
    setForm({ project_id: "", description: "", type: "Despesa", category: "", value: "", due_date: "", status: "A pagar", notes: "" });
    load();
  };

  const filtered = filterProject === "all" ? entries : entries.filter(e => e.project_id === filterProject);
  const receitas = filtered.filter(e => e.type === "Receita").reduce((s, e) => s + (e.value || 0), 0);
  const despesas = filtered.filter(e => e.type === "Despesa").reduce((s, e) => s + (e.value || 0), 0);
  const saldo = receitas - despesas;
  const aVencer = filtered.filter(e => e.status === "A pagar" || e.status === "Atrasado");
  const atrasados = filtered.filter(e => e.status === "Atrasado");

  const byMonth = {};
  filtered.forEach(e => {
    const key = e.due_date?.substring(0, 7) || "S/D";
    if (!byMonth[key]) byMonth[key] = { month: key.replace("-", "/"), receita: 0, despesa: 0 };
    if (e.type === "Receita") byMonth[key].receita += e.value || 0;
    else byMonth[key].despesa += e.value || 0;
  });
  const chartData = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

  const fmt = v => `R$${(v / 1000).toFixed(0)}k`;

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Fluxo de Caixa" subtitle="Controle financeiro integrado de todas as obras">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Lançamento</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Lançamento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Obra</Label>
                <Select value={form.project_id} onValueChange={v => set("project_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Descrição</Label><Input value={form.description} onChange={e => set("description", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => { set("type", v); set("category", ""); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Receita">Receita</SelectItem><SelectItem value="Despesa">Despesa</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={v => set("category", v)}>
                    <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                    <SelectContent>{(form.type === "Receita" ? CATEGORIES_RECEITA : CATEGORIES_DESPESA).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Valor (R$)</Label><Input type="number" value={form.value} onChange={e => set("value", e.target.value)} /></div>
                <div><Label>Vencimento</Label><Input type="date" value={form.due_date} onChange={e => set("due_date", e.target.value)} /></div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Previsto", "A pagar", "Pago", "Atrasado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={save} disabled={saving || !form.project_id || !form.description || !form.value} className="w-full">{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-6 space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterProject("all")} className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${filterProject === "all" ? "bg-primary text-white border-primary" : "border-border"}`}>Todas</button>
          {projects.map(p => (
            <button key={p.id} onClick={() => setFilterProject(p.id)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${filterProject === p.id ? "bg-primary text-white border-primary" : "border-border"}`}>{p.name}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-emerald-500" /><p className="text-xs text-muted-foreground">Receitas</p></div>
            <p className="text-xl font-black text-emerald-600">{fmt(receitas)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><TrendingDown className="h-4 w-4 text-red-500" /><p className="text-xs text-muted-foreground">Despesas</p></div>
            <p className="text-xl font-black text-red-600">{fmt(despesas)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Saldo</p></div>
            <p className={`text-xl font-black ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(saldo)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-amber-500" /><p className="text-xs text-muted-foreground">A vencer</p></div>
            <p className={`text-xl font-black ${atrasados.length > 0 ? "text-red-600" : "text-amber-600"}`}>{aVencer.length}</p>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Fluxo por Período</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, n) => [`R$ ${v.toLocaleString("pt-BR")}`, n === "receita" ? "Receita" : "Despesa"]} />
                <ReferenceLine y={0} stroke="hsl(var(--border))" />
                <Bar dataKey="receita" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="despesa" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <Tabs defaultValue="pendente">
          <TabsList>
            <TabsTrigger value="pendente">A Pagar / Atrasados</TabsTrigger>
            <TabsTrigger value="todos">Todos os Lançamentos</TabsTrigger>
          </TabsList>
          <TabsContent value="pendente">
            <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
              {aVencer.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 text-sm">Nenhum lançamento pendente</p>
              ) : (
                <div className="divide-y divide-border">
                          {aVencer.map(e => (
                            <div key={e.id} className={cn("flex items-center gap-3 px-4 py-3", e.status === "Atrasado" ? "bg-red-50" : "")}>
                              <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0", e.type === "Receita" ? "bg-emerald-100" : "bg-red-100")}>
                                {e.type === "Receita" ? <ArrowUpRight className="h-4 w-4 text-emerald-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{e.description}</p>
                                <p className="text-xs text-muted-foreground">{e.project_name} · Venc: {e.due_date || "—"}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right">
                                  <p className={cn("text-sm font-black", e.status === "Atrasado" ? "text-red-600" : "text-amber-600")}>R$ {(e.value || 0).toLocaleString("pt-BR")}</p>
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColor[e.status] || ""}`}>{e.status}</span>
                                </div>
                                <BaixaDialog entry={e} onDone={load} />
                              </div>
                            </div>
                          ))}
                        </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="todos">
            <div className="bg-card border border-border rounded-xl overflow-hidden mt-3">
              {filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 text-sm">Nenhum lançamento cadastrado</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Categoria</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {filtered.slice(0, 50).map(e => (
                        <tr key={e.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{e.description}<p className="text-[10px] text-muted-foreground">{e.project_name}</p></td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-xs">{e.category}</td>
                          <td className={`px-4 py-3 text-right font-medium ${e.type === "Receita" ? "text-emerald-600" : "text-red-600"}`}>R$ {(e.value || 0).toLocaleString("pt-BR")}</td>
                          <td className="px-4 py-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${e.type === "Receita" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{e.type}</span></td>
                          <td className="px-4 py-3 text-center"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[e.status] || ""}`}>{e.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
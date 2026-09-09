import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Package, AlertTriangle, ShoppingCart, Loader2, Zap } from "lucide-react";
import PageHeader from "../components/PageHeader";

const CATEGORIES = ["Concreto", "Aço/Ferragem", "Alvenaria", "Hidráulico", "Elétrico", "Acabamento", "Terraplanagem", "Pavimentação", "Locação de Equipamento", "Mão de obra", "Outro"];
const PRIORITIES = ["Baixa", "Média", "Alta", "Urgente"];

const priorityColor = {
  "Urgente": "bg-red-50 text-red-700 border-red-200",
  "Alta": "bg-orange-50 text-orange-700 border-orange-200",
  "Média": "bg-amber-50 text-amber-700 border-amber-200",
  "Baixa": "bg-gray-50 text-gray-600 border-gray-200",
};

const statusColor = {
  "Em falta": "bg-red-50 text-red-700",
  "Baixo estoque": "bg-amber-50 text-amber-700",
  "Disponível": "bg-emerald-50 text-emerald-700",
  "Pedido realizado": "bg-blue-50 text-blue-700",
  "Entregue": "bg-purple-50 text-purple-700",
};

export default function Supplies() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({ project_id: "", name: "", category: "", unit: "", quantity_needed: "", quantity_in_stock: "0", unit_price: "", supplier: "", status: "Disponível", priority: "Média", needed_by: "", notes: "" });

  const load = () => base44.auth.me().then(me => Promise.all([
    base44.entities.Supply.filter({ created_by_id: me.id }, "-created_date", 100),
    base44.entities.Project.filter({ created_by_id: me.id }),
  ]).then(([s, p]) => { setItems(s); setProjects(p); setLoading(false); }));

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const project = projects.find(p => p.id === form.project_id);
    const qty = Number(form.quantity_needed) || 0;
    const price = Number(form.unit_price) || 0;
    await base44.entities.Supply.create({
      ...form,
      project_name: project?.name || "",
      quantity_needed: qty,
      quantity_in_stock: Number(form.quantity_in_stock) || 0,
      unit_price: price,
      total_value: qty * price
    });
    setSaving(false);
    setOpen(false);
    setForm({ project_id: "", name: "", category: "", unit: "", quantity_needed: "", quantity_in_stock: "0", unit_price: "", supplier: "", status: "Disponível", priority: "Média", needed_by: "", notes: "" });
    load();
  };

  const generateAISuggestions = async () => {
    setAiLoading(true);
    const summary = items.map(i => ({ name: i.name, cat: i.category, stock: i.quantity_in_stock, needed: i.quantity_needed, status: i.status, priority: i.priority, date: i.needed_by }));
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em gestão de suprimentos para obras de construção civil. Analise o estoque atual e gere recomendações de compra urgentes.

Estoque atual: ${JSON.stringify(summary)}

Identifique:
1. Materiais críticos que precisam de compra imediata
2. Materiais com risco de paralisação
3. Oportunidades de compra antecipada
4. Alertas de desperdício ou excesso
5. Sequência de compras recomendada

Seja prático e específico.`,
      response_json_schema: {
        type: "object",
        properties: {
          urgent_purchases: { type: "array", items: { type: "object", properties: { item: { type: "string" }, reason: { type: "string" }, days_to_act: { type: "number" } } } },
          risk_alerts: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          summary: { type: "string" }
        }
      }
    });
    setAiSuggestions(res);
    setAiLoading(false);
  };

  const filtered = filterStatus === "all" ? items : items.filter(i => i.status === filterStatus);
  const urgent = items.filter(i => i.status === "Em falta" || i.status === "Baixo estoque" || i.priority === "Urgente");

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Suprimentos e Compras" subtitle="Gestão integrada de materiais, estoque e compras das obras">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Novo Item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Material/Suprimento</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[75vh] overflow-y-auto">
              <div>
                <Label>Obra</Label>
                <Select value={form.project_id} onValueChange={v => set("project_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Material/Serviço</Label><Input value={form.name} onChange={e => set("name", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category} onValueChange={v => set("category", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Unidade</Label><Input value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="m³, ton, kg..." /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Qtd Necessária</Label><Input type="number" value={form.quantity_needed} onChange={e => set("quantity_needed", e.target.value)} /></div>
                <div><Label>Estoque</Label><Input type="number" value={form.quantity_in_stock} onChange={e => set("quantity_in_stock", e.target.value)} /></div>
                <div><Label>Preço Unit.</Label><Input type="number" value={form.unit_price} onChange={e => set("unit_price", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Prioridade</Label>
                  <Select value={form.priority} onValueChange={v => set("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Necessário para</Label><Input type="date" value={form.needed_by} onChange={e => set("needed_by", e.target.value)} /></div>
              </div>
              <div><Label>Fornecedor</Label><Input value={form.supplier} onChange={e => set("supplier", e.target.value)} /></div>
              <Button onClick={save} disabled={saving || !form.project_id || !form.name} className="w-full">{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total de itens", count: items.length, color: "text-foreground", icon: Package },
            { label: "Em falta", count: items.filter(i => i.status === "Em falta").length, color: "text-red-600", icon: AlertTriangle },
            { label: "Baixo estoque", count: items.filter(i => i.status === "Baixo estoque").length, color: "text-amber-600", icon: AlertTriangle },
            { label: "Urgentes", count: urgent.length, color: "text-red-600", icon: ShoppingCart },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <s.icon className={`h-6 w-6 ${s.color}`} />
              <div><p className={`text-2xl font-bold ${s.color}`}>{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={generateAISuggestions} disabled={aiLoading || items.length === 0} className="w-full">
          {aiLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando suprimentos...</> : <><Zap className="h-4 w-4 mr-2" />Gerar Recomendações de Compra com IA</>}
        </Button>

        {aiSuggestions && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-800">Análise de Suprimentos por IA</p>
            <p className="text-sm text-blue-700">{aiSuggestions.summary}</p>
            {aiSuggestions.urgent_purchases?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-red-700 mb-1">🚨 Compras Urgentes</p>
                {aiSuggestions.urgent_purchases.map((u, i) => (
                  <div key={i} className="text-xs text-red-700 flex items-start gap-1.5 mb-1">
                    <span>•</span><span><strong>{u.item}</strong> — {u.reason} (agir em {u.days_to_act} dias)</span>
                  </div>
                ))}
              </div>
            )}
            {aiSuggestions.recommendations?.length > 0 && (
              <ul className="space-y-1">{aiSuggestions.recommendations.map((r, i) => <li key={i} className="text-xs text-blue-700 flex items-start gap-1.5"><span>→</span>{r}</li>)}</ul>
            )}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "Em falta", "Baixo estoque", "Disponível", "Pedido realizado"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors shrink-0 ${filterStatus === s ? "bg-primary text-white border-primary" : "border-border"}`}>{s === "all" ? "Todos" : s}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-12 gap-2">
            <Package className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum item cadastrado</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(item => (
              <div key={item.id} className={`bg-card border rounded-xl p-4 ${item.status === "Em falta" || item.priority === "Urgente" ? "border-red-200" : "border-border"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category} · {item.project_name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${priorityColor[item.priority] || ""}`}>{item.priority}</span>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Estoque: <strong>{item.quantity_in_stock || 0}/{item.quantity_needed || 0} {item.unit}</strong></span>
                  {item.unit_price > 0 && <span className="text-muted-foreground">R$ {((item.quantity_needed || 0) * (item.unit_price || 0)).toLocaleString("pt-BR")}</span>}
                </div>
                {item.quantity_needed > 0 && (
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full ${item.quantity_in_stock >= item.quantity_needed ? "bg-emerald-500" : item.quantity_in_stock > 0 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(100, ((item.quantity_in_stock || 0) / item.quantity_needed) * 100)}%` }} />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[item.status] || "bg-gray-100 text-gray-600"}`}>{item.status}</span>
                  {item.needed_by && <span className="text-[10px] text-muted-foreground">Até {item.needed_by}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
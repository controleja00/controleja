import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, TrendingUp, Search, BarChart3 } from "lucide-react";
import PageHeader from "../components/PageHeader";

const CATEGORIES = ["Terraplenagem", "Drenagem", "Pavimentação", "Demolição", "Alvenaria", "Acabamento", "Estrutura", "Instalações", "Limpeza pós-obra"];

export default function Benchmark() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ service: "", category: "", region: "", unit: "", avg_price: "", min_price: "", max_price: "", avg_productivity: "", productivity_unit: "", sample_size: "", period: "" });
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Benchmark.list().then(d => { setItems(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    await base44.entities.Benchmark.create({
      ...form,
      avg_price: Number(form.avg_price) || 0,
      min_price: Number(form.min_price) || 0,
      max_price: Number(form.max_price) || 0,
      avg_productivity: Number(form.avg_productivity) || 0,
      sample_size: Number(form.sample_size) || 0,
    });
    setSaving(false);
    setOpen(false);
    setForm({ service: "", category: "", region: "", unit: "", avg_price: "", min_price: "", max_price: "", avg_productivity: "", productivity_unit: "", sample_size: "", period: "" });
    load();
  };

  const filtered = items.filter(i => i.service?.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()) || i.region?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Benchmark Nacional" subtitle="Banco de dados de produtividade e preços de referência da construção civil">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Adicionar Referência</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Referência de Benchmark</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              <div><Label>Serviço</Label><Input value={form.service} onChange={e => set("service", e.target.value)} /></div>
              <div><Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => set("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Região</Label><Input value={form.region} onChange={e => set("region", e.target.value)} placeholder="Ex: São Paulo, Nordeste..." /></div>
              <div><Label>Unidade</Label><Input value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="m², m³, ml..." /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Preço Mín.</Label><Input type="number" value={form.min_price} onChange={e => set("min_price", e.target.value)} /></div>
                <div><Label>Preço Méd.</Label><Input type="number" value={form.avg_price} onChange={e => set("avg_price", e.target.value)} /></div>
                <div><Label>Preço Máx.</Label><Input type="number" value={form.max_price} onChange={e => set("max_price", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Produtividade Média</Label><Input type="number" value={form.avg_productivity} onChange={e => set("avg_productivity", e.target.value)} /></div>
                <div><Label>Unidade Produt.</Label><Input value={form.productivity_unit} onChange={e => set("productivity_unit", e.target.value)} placeholder="m²/dia..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Amostra (obras)</Label><Input type="number" value={form.sample_size} onChange={e => set("sample_size", e.target.value)} /></div>
                <div><Label>Período</Label><Input value={form.period} onChange={e => set("period", e.target.value)} placeholder="2025/2026" /></div>
              </div>
              <Button onClick={save} disabled={saving || !form.service || !form.category} className="w-full">{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>
      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar serviço, categoria, região..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 gap-3">
            <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum dado de benchmark cadastrado</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(b => (
              <div key={b.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-sm">{b.service}</p>
                    <p className="text-xs text-muted-foreground">{b.category} · {b.region || "Nacional"}</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                </div>
                {b.avg_price > 0 && (
                  <div className="space-y-1.5 border-t border-border pt-3 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Preço médio</span>
                      <span className="font-semibold">R$ {b.avg_price.toLocaleString("pt-BR")}/{b.unit}</span>
                    </div>
                    {b.min_price > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Mínimo</span><span>R$ {b.min_price.toLocaleString("pt-BR")}</span></div>}
                    {b.max_price > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Máximo</span><span>R$ {b.max_price.toLocaleString("pt-BR")}</span></div>}
                    {b.avg_productivity > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Produtividade</span><span className="font-medium text-emerald-600">{b.avg_productivity} {b.productivity_unit}</span></div>}
                    {b.sample_size > 0 && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Amostra</span><span>{b.sample_size} obras</span></div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
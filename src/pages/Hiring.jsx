import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Search, Zap, Users, MapPin, Calendar, DollarSign, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PageHeader from "../components/PageHeader";

const SERVICE_TYPES = ["Terraplenagem", "Drenagem", "Pavimentação", "Demolição", "Alvenaria", "Acabamento", "Estrutura", "Instalações", "Limpeza pós-obra", "Locação de Equipamento", "Outro"];

const statusColor = {
  "Aberta": "bg-blue-50 text-blue-700",
  "Em análise": "bg-amber-50 text-amber-700",
  "Proposta recebida": "bg-purple-50 text-purple-700",
  "Contratado": "bg-emerald-50 text-emerald-700",
  "Cancelada": "bg-gray-100 text-gray-500",
};

const statusDot = {
  "Aberta": "bg-blue-500",
  "Em análise": "bg-amber-500",
  "Proposta recebida": "bg-purple-500",
  "Contratado": "bg-emerald-500",
  "Cancelada": "bg-gray-400",
};

export default function Hiring() {
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    project_id: "", service_type: "", description: "", location: "",
    start_date: "", deadline_days: "", area_size: "", estimated_budget: "",
    workers_needed: "", equipment_needed: "", technical_requirements: ""
  });

  const load = () => base44.auth.me().then(me => Promise.all([
    base44.entities.HiringRequest.filter({ created_by_id: me.id }, "-created_date"),
    base44.entities.Project.filter({ created_by_id: me.id }),
  ]).then(([r, p]) => { setRequests(r); setProjects(p); setLoading(false); }));

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const project = projects.find(p => p.id === form.project_id);
    await base44.entities.HiringRequest.create({
      ...form,
      project_name: project?.name || "",
      estimated_budget: Number(form.estimated_budget) || 0,
      workers_needed: Number(form.workers_needed) || 0,
      deadline_days: Number(form.deadline_days) || 0,
      status: "Aberta",
    });
    setSaving(false);
    setOpen(false);
    setForm({ project_id: "", service_type: "", description: "", location: "", start_date: "", deadline_days: "", area_size: "", estimated_budget: "", workers_needed: "", equipment_needed: "", technical_requirements: "" });
    load();
  };

  const filtered = requests.filter(r =>
    r.description?.toLowerCase().includes(search.toLowerCase()) ||
    r.service_type?.toLowerCase().includes(search.toLowerCase()) ||
    r.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: requests.length,
    abertas: requests.filter(r => r.status === "Aberta").length,
    emAnalise: requests.filter(r => r.status === "Em análise").length,
    contratadas: requests.filter(r => r.status === "Contratado").length,
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Central de Contratações" subtitle="Encontre e contrate os melhores empreiteiros com inteligência artificial">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Nova Necessidade</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Abrir Nova Necessidade de Contratação</DialogTitle></DialogHeader>
            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <Label>Obra (opcional)</Label>
                <Select value={form.project_id} onValueChange={v => set("project_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Serviço *</Label>
                <Select value={form.service_type} onValueChange={v => set("service_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição da Necessidade *</Label>
                <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder='Ex: "Terraplenagem de 8.000m² com corte em rocha"' rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Localização *</Label><Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Cidade, UF" /></div>
                <div><Label>Tamanho do Serviço</Label><Input value={form.area_size} onChange={e => set("area_size", e.target.value)} placeholder="Ex: 8.000m²" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Início Previsto</Label><Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} /></div>
                <div><Label>Prazo (dias)</Label><Input type="number" value={form.deadline_days} onChange={e => set("deadline_days", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Orçamento Estimado (R$)</Label><Input type="number" value={form.estimated_budget} onChange={e => set("estimated_budget", e.target.value)} /></div>
                <div><Label>Funcionários Necessários</Label><Input type="number" value={form.workers_needed} onChange={e => set("workers_needed", e.target.value)} /></div>
              </div>
              <div><Label>Equipamentos Necessários</Label><Input value={form.equipment_needed} onChange={e => set("equipment_needed", e.target.value)} placeholder="Ex: Escavadeira 20t, caminhão basculante" /></div>
              <div><Label>Exigências Técnicas/Documentais</Label><Textarea value={form.technical_requirements} onChange={e => set("technical_requirements", e.target.value)} placeholder="Ex: NR-18, ASO atualizado, seguro obrigatório" rows={2} /></div>
              <Button onClick={save} disabled={saving || !form.service_type || !form.description || !form.location} className="w-full">
                {saving ? "Salvando..." : "Abrir Necessidade e Buscar Empreiteiros"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Abertas", value: stats.abertas, color: "text-blue-600" },
            { label: "Em Análise", value: stats.emAnalise, color: "text-amber-600" },
            { label: "Contratadas", value: stats.contratadas, color: "text-emerald-600" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar necessidade..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 gap-3">
            <Users className="h-12 w-12 text-muted-foreground/20" />
            <p className="text-muted-foreground text-sm">Nenhuma necessidade de contratação aberta</p>
            <Button onClick={() => setOpen(true)} variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Abrir primeira necessidade</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(r => (
              <Link key={r.id} to={`/hiring/${r.id}`} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${statusDot[r.status]}`} />
                      <p className="text-xs text-muted-foreground font-medium">{r.service_type}</p>
                    </div>
                    <p className="font-semibold text-sm line-clamp-2">{r.description}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColor[r.status]}`}>{r.status}</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {r.location && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{r.location}</div>}
                  {r.start_date && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3 shrink-0" />Início: {r.start_date}{r.deadline_days ? ` · ${r.deadline_days} dias` : ""}</div>}
                  {r.estimated_budget > 0 && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><DollarSign className="h-3 w-3 shrink-0" />R$ {r.estimated_budget.toLocaleString("pt-BR")}</div>}
                  {r.workers_needed > 0 && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3 w-3 shrink-0" />{r.workers_needed} funcionários</div>}
                </div>
                {r.project_name && <p className="text-[11px] text-muted-foreground border-t border-border pt-2 mt-2">Obra: {r.project_name}</p>}
                <div className="flex items-center justify-between mt-3">
                  {r.status === "Contratado" ? (
                    <p className="text-xs font-medium text-emerald-700">✓ {r.hired_subcontractor_name}</p>
                  ) : (
                    <p className="text-xs text-primary font-medium flex items-center gap-1"><Zap className="h-3 w-3" />Ver candidatos com IA</p>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
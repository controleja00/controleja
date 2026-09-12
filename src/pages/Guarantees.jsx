import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { OWN_TEAM_ID, OWN_TEAM_NAME, isOwnTeam } from "@/lib/workActors";

const statusColor = {
  "Ativa": "bg-emerald-50 text-emerald-700",
  "Vencida": "bg-gray-100 text-gray-600",
  "Em reclamação": "bg-red-50 text-red-700",
  "Encerrada": "bg-secondary text-primary"
};

export default function Guarantees() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ project_id: "", subcontractor_id: "", service: "", completion_date: "", warranty_months: "12", notes: "" });

  const load = () => base44.auth.me()
    .then((me) => Promise.all([
      base44.entities.Guarantee.filter({ created_by_id: me.id }, "-created_date"),
      base44.entities.Project.filter({ created_by_id: me.id }),
      base44.entities.Subcontractor.filter({ created_by_id: me.id })
    ]))
    .then(([g, p, s]) => { setItems(g); setProjects(p); setSubs(s); setLoading(false); });

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const project = projects.find(p => p.id === form.project_id);
    const sub = subs.find(s => s.id === form.subcontractor_id);
    const months = Number(form.warranty_months) || 12;
    let warranty_end_date = "";
    if (form.completion_date) {
      const d = new Date(form.completion_date);
      d.setMonth(d.getMonth() + months);
      warranty_end_date = d.toISOString().split("T")[0];
    }
    await base44.entities.Guarantee.create({
      ...form,
      project_name: project?.name || "",
      subcontractor_name: isOwnTeam(form.subcontractor_id) ? OWN_TEAM_NAME : sub?.company_name || "",
      warranty_months: months,
      warranty_end_date
    });
    setSaving(false);
    setOpen(false);
    setForm({ project_id: "", subcontractor_id: "", service: "", completion_date: "", warranty_months: "12", notes: "" });
    load();
  };

  const isExpiringSoon = (g) => {
    if (!g.warranty_end_date || g.status !== "Ativa") return false;
    const days = (new Date(g.warranty_end_date) - new Date()) / 86400000;
    return days <= 30 && days >= 0;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Garantias Digitais" subtitle="Rastreamento de garantias pós-obra e histórico de qualidade">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Nova Garantia</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Garantia</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Obra</Label>
                <Select value={form.project_id} onValueChange={v => set("project_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                  <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Responsável</Label>
                <Select value={form.subcontractor_id} onValueChange={v => set("subcontractor_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o responsável" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OWN_TEAM_ID}>{OWN_TEAM_NAME}</SelectItem>
                    {subs.map(s => <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Serviço executado</Label><Input value={form.service} onChange={e => set("service", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Data de Conclusão</Label><Input type="date" value={form.completion_date} onChange={e => set("completion_date", e.target.value)} /></div>
                <div><Label>Garantia (meses)</Label><Input type="number" value={form.warranty_months} onChange={e => set("warranty_months", e.target.value)} /></div>
              </div>
              <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} /></div>
              <Button onClick={save} disabled={saving || !form.project_id || !form.subcontractor_id || !form.service} className="w-full">{saving ? "Salvando..." : "Registrar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="p-6 space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Ativas", count: items.filter(i => i.status === "Ativa").length, color: "text-emerald-600", icon: ShieldCheck },
            { label: "Expirando em 30 dias", count: items.filter(isExpiringSoon).length, color: "text-amber-600", icon: Clock },
            { label: "Em reclamação", count: items.filter(i => i.status === "Em reclamação").length, color: "text-red-600", icon: AlertCircle }
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color}`} />
              <div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-16 gap-3">
            <ShieldCheck className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhuma garantia registrada</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Serviço</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Obra</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Subempreiteiro</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vencimento</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {items.map(g => (
                    <tr key={g.id} className={`hover:bg-muted/30 ${isExpiringSoon(g) ? "bg-amber-50/30" : ""}`}>
                      <td className="px-4 py-3 font-medium">
                        {g.service}
                        {isExpiringSoon(g) && <span className="ml-2 text-[10px] text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Expirando</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{g.project_name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{g.subcontractor_name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{g.warranty_end_date || "—"}<br /><span className="text-[10px]">{g.warranty_months}m garantia</span></td>
                      <td className="px-4 py-3 text-center"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor[g.status] || "bg-gray-100"}`}>{g.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

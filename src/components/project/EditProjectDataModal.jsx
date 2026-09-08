import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS = ["Planejamento", "Em andamento", "Atrasada", "Concluída", "Paralisada", "Arquivada"];

function formatBRL(value) {
  if (!value && value !== 0) return "";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseBRL(str) {
  return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
}
function makeCurrencyHandler(setter) {
  return (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) { setter(""); return; }
    setter(formatBRL(parseInt(digits, 10) / 100));
  };
}

export default function EditProjectDataModal({ open, onClose, project, onSaved }) {
  const [form, setForm] = useState({
    client: project.client || "",
    technical_responsible: project.technical_responsible || "",
    status: project.status || "Em andamento",
    start_date: project.start_date || "",
    expected_end_date: project.expected_end_date || "",
    contracted_value: project.contracted_value ? formatBRL(project.contracted_value) : "",
    budget: project.budget ? formatBRL(project.budget) : "",
    progress_percent: project.progress_percent ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      client: form.client,
      technical_responsible: form.technical_responsible,
      status: form.status,
      start_date: form.start_date,
      expected_end_date: form.expected_end_date,
      contracted_value: form.contracted_value ? parseBRL(form.contracted_value) : null,
      budget: form.budget ? parseBRL(form.budget) : null,
      progress_percent: Math.min(100, Math.max(0, Number(form.progress_percent) || 0)),
    };
    await base44.entities.Project.update(project.id, updates);
    setSaving(false);
    toast.success("Dados da obra atualizados com sucesso.");
    onSaved({ ...project, ...updates });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Dados da Obra
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Cliente</Label>
              <Input className="mt-1" value={form.client} onChange={e => set("client", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Responsável Técnico</Label>
              <Input className="mt-1" value={form.technical_responsible} onChange={e => set("technical_responsible", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Status</Label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Data de Início</Label>
              <Input type="date" className="mt-1" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Prazo de Entrega</Label>
              <Input type="date" className="mt-1" value={form.expected_end_date} onChange={e => set("expected_end_date", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Receita Contratada (R$)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">R$</span>
              <Input className="pl-8" placeholder="0,00" value={form.contracted_value} onChange={makeCurrencyHandler(v => set("contracted_value", v))} inputMode="numeric" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Orçamento Previsto (R$)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">R$</span>
              <Input className="pl-8" placeholder="0,00" value={form.budget} onChange={makeCurrencyHandler(v => set("budget", v))} inputMode="numeric" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Progresso Físico (%)</Label>
            <Input type="number" min={0} max={100} className="mt-1 text-center font-bold" value={form.progress_percent}
              onChange={e => set("progress_percent", Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
              inputMode="numeric" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar Dados"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
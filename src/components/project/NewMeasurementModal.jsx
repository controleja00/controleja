import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const UNITS = ["m²", "m³", "metro linear", "diária", "percentual", "unidade"];

const getEmpty = () => ({
  subcontractor_id: "",
  service: "",
  unit: "",
  contracted_qty: "",
  executed_qty: "",
  unit_price: "",
  measurement_date: new Date().toISOString().split("T")[0],
  comments: "",
  photos: [],
});

export default function NewMeasurementModal({ open, onOpenChange, project, onSaved }) {
  const [form, setForm] = useState(getEmpty);
  const [subs, setSubs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.entities.Subcontractor.list().then(setSubs);
  }, []);

  useEffect(() => {
    if (open) setForm(getEmpty());
  }, [open]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const totalValue = (Number(form.executed_qty) || 0) * (Number(form.unit_price) || 0);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, photos: [...(prev.photos || []), file_url] }));
    } catch (err) {
      toast.error("Erro ao enviar foto: " + err.message);
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.service || !form.unit) {
      toast.error("Preencha os campos obrigatórios: Serviço e Unidade.");
      return;
    }

    setSaving(true);
    try {
      const sub = subs.find(s => s.id === form.subcontractor_id);
      await base44.entities.Measurement.create({
        ...form,
        project_id: project.id,
        project_name: project.name,
        subcontractor_name: sub?.company_name || "",
        contracted_qty: Number(form.contracted_qty) || 0,
        executed_qty: Number(form.executed_qty) || 0,
        unit_price: Number(form.unit_price) || 0,
        total_value: totalValue,
        status: "Pendente",
      });
      toast.success("Medição criada com sucesso!");
      onSaved();
    } catch (err) {
      console.error("Erro ao criar medição:", err);
      toast.error("Erro ao salvar: " + (err.message || "Tente novamente."));
    }
    setSaving(false);
  };

  // Filter subs linked to this project if available
  const filteredSubs = project?.subcontractor_ids?.length
    ? subs.filter(s => project.subcontractor_ids.includes(s.id))
    : subs;

  const phases = project?.phases || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Medição</DialogTitle>
          <p className="text-xs text-muted-foreground">{project?.name}</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Serviço */}
          <div>
            <Label>Serviço Executado *</Label>
            <Input
              value={form.service}
              onChange={e => set("service", e.target.value)}
              placeholder="Ex: Terraplenagem — Corte e Aterro"
              className="mt-1"
            />
          </div>

          {/* Fase */}
          {phases.length > 0 && (
            <div>
              <Label>Fase da Obra</Label>
              <Select value={form.phase_name || ""} onValueChange={v => set("phase_name", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar fase (opcional)" /></SelectTrigger>
                <SelectContent>
                  {phases.map((p, i) => (
                    <SelectItem key={i} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Empreiteiro */}
          <div>
            <Label>Empreiteiro</Label>
            <Select value={form.subcontractor_id} onValueChange={v => set("subcontractor_id", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar (opcional)" /></SelectTrigger>
              <SelectContent>
                {filteredSubs.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>
                ))}
                {filteredSubs.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">Nenhum empreiteiro vinculado</p>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Grid numérico */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unidade *</Label>
              <Select value={form.unit} onValueChange={v => set("unit", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data da Medição</Label>
              <Input type="date" value={form.measurement_date} onChange={e => set("measurement_date", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Qtd Contratada</Label>
              <Input type="number" value={form.contracted_qty} onChange={e => set("contracted_qty", e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Qtd Executada</Label>
              <Input type="number" value={form.executed_qty} onChange={e => set("executed_qty", e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Valor Unitário (R$)</Label>
              <Input type="number" value={form.unit_price} onChange={e => set("unit_price", e.target.value)} placeholder="0,00" className="mt-1" />
            </div>
            <div>
              <Label>Valor Total</Label>
              <div className="mt-1 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 font-bold text-sm h-9 flex items-center">
                R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Textarea value={form.comments} onChange={e => set("comments", e.target.value)} placeholder="Detalhes adicionais..." className="mt-1" rows={2} />
          </div>

          {/* Fotos */}
          <div>
            <Label>Fotos / Evidências (opcional)</Label>
            <Input type="file" accept="image/*" onChange={handlePhoto} className="mt-1" />
            {uploading && <p className="text-xs text-muted-foreground mt-1 animate-pulse">Enviando foto...</p>}
            {form.photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.photos.map((url, i) => (
                  <img key={i} src={url} className="h-14 w-14 object-cover rounded-lg border" alt="" />
                ))}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-2">
            <Button onClick={save} disabled={saving || uploading} className="flex-1">
              {saving ? "Salvando..." : "Criar Medição"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
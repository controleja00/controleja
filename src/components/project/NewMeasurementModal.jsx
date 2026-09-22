import { useState, useEffect } from "react";
import { consuobra } from "@/api/consuobraClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { OWN_TEAM_ID, OWN_TEAM_NAME, isOwnTeam } from "@/lib/workActors";

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
  const [error, setError] = useState("");

  useEffect(() => {
    consuobra.auth.me().then((me) => consuobra.entities.Subcontractor.filter({ created_by_id: me.id }).then(setSubs));
  }, []);

  useEffect(() => {
    if (open) {
      setForm(getEmpty());
      setError("");
    }
  }, [open]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const totalValue = (Number(form.executed_qty) || 0) * (Number(form.unit_price) || 0);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await consuobra.integrations.Core.UploadFile({ file });
      setForm(prev => ({ ...prev, photos: [...(prev.photos || []), file_url] }));
    } catch (err) {
      toast.error("Erro ao enviar foto: " + err.message);
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.subcontractor_id || !form.service || !form.unit) {
      toast.error("Preencha os campos obrigatórios: Responsável, Serviço e Unidade.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const sub = subs.find(s => s.id === form.subcontractor_id);
      await consuobra.entities.Measurement.create({
        project_id: project.id,
        project_name: project.name,
        subcontractor_id: isOwnTeam(form.subcontractor_id) ? null : form.subcontractor_id,
        subcontractor_name: isOwnTeam(form.subcontractor_id) ? OWN_TEAM_NAME : sub?.company_name || "",
        service: form.service,
        unit: form.unit,
        contracted_qty: Number(form.contracted_qty) || 0,
        executed_qty: Number(form.executed_qty) || 0,
        unit_price: Number(form.unit_price) || 0,
        total_value: totalValue,
        measurement_date: form.measurement_date || null,
        comments: form.phase_name
          ? `Fase: ${form.phase_name}${form.comments ? `\n${form.comments}` : ""}`
          : form.comments,
        photos: form.photos || [],
        status: "Pendente",
      });
      toast.success("Medição criada com sucesso!");
      onSaved();
    } catch (err) {
      console.error("Erro ao criar medição:", err);
      setError("Não foi possível salvar a medição. Revise os dados ou tente novamente.");
      toast.error("Não foi possível salvar a medição.");
    } finally {
      setSaving(false);
    }
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
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
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
            <Label>Responsável pela execução *</Label>
            <Select value={form.subcontractor_id} onValueChange={v => set("subcontractor_id", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione quem executou" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={OWN_TEAM_ID}>{OWN_TEAM_NAME}</SelectItem>
                {filteredSubs.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>
                ))}
                {filteredSubs.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">Use equipe propria ou cadastre empreiteiros depois.</p>
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
              <div className="cj-readonly-field cj-readonly-field--success mt-1 h-10 text-sm">
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

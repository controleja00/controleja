import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "../components/PageHeader";

const units = ["m²", "m³", "metro linear", "diária", "percentual", "unidade"];

export default function MeasurementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";

  // Read project_id from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledProjectId = urlParams.get("project_id");

  const [form, setForm] = useState({
    project_id: prefilledProjectId || "",
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
  const [projects, setProjects] = useState([]);
  const [subs, setSubs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      base44.entities.Project.list(),
      base44.entities.Subcontractor.list(),
    ]).then(([p, s]) => {
      setProjects(p);
      setSubs(s);
    });
    if (isEdit) base44.entities.Measurement.get(id).then(setForm);
  }, [id]);

  const set = (k, v) => {
    setError("");
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const totalValue = (Number(form.executed_qty) || 0) * (Number(form.unit_price) || 0);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photos: [...(prev.photos || []), file_url] }));
    setUploading(false);
  };

  const save = async () => {
    if (!form.project_id || !form.subcontractor_id || !form.service || !form.unit) {
      setError("Preencha os campos obrigatórios para criar a medição.");
      return;
    }
    setSaving(true);
    const proj = projects.find(p => p.id === form.project_id);
    const sub = subs.find(s => s.id === form.subcontractor_id);
    const data = {
      ...form,
      project_name: proj?.name || "",
      subcontractor_name: sub?.company_name || "",
      contracted_qty: Number(form.contracted_qty) || 0,
      executed_qty: Number(form.executed_qty) || 0,
      unit_price: Number(form.unit_price) || 0,
      total_value: totalValue,
      status: "Pendente",
    };
    if (isEdit) {
      await base44.entities.Measurement.update(id, data);
    } else {
      await base44.entities.Measurement.create(data);
    }
    // Navigate back to project central if came from a project, else to measurements list
    if (prefilledProjectId) {
      navigate(`/projects/${prefilledProjectId}/central`);
    } else {
      navigate("/measurements");
    }
  };

  const handleCancel = () => {
    if (prefilledProjectId) {
      navigate(`/projects/${prefilledProjectId}/central`);
    } else {
      navigate("/measurements");
    }
  };

  // Filter subs by project's linked subcontractors if available
  const selectedProject = projects.find(p => p.id === form.project_id);
  const filteredSubs = selectedProject?.subcontractor_ids?.length
    ? subs.filter(s => selectedProject.subcontractor_ids.includes(s.id))
    : subs;

  return (
    <div>
      <PageHeader
        title={isEdit ? "Editar Medição" : "Nova Medição"}
        subtitle={selectedProject ? `Obra: ${selectedProject.name}` : undefined}
      />
      <div className="p-6 max-w-2xl space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Obra — locked if pre-filled from project */}
          <div className="sm:col-span-2">
            <Label>Obra *</Label>
            {prefilledProjectId ? (
              <div className="mt-1 px-3 py-2 bg-muted rounded-lg text-sm font-medium border border-border">
                {selectedProject?.name || prefilledProjectId}
              </div>
            ) : (
              <Select value={form.project_id} onValueChange={v => set("project_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label>Empreiteiro Responsável *</Label>
            <Select value={form.subcontractor_id} onValueChange={v => set("subcontractor_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {filteredSubs.map(s => <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <Label>Serviço Executado *</Label>
            <Input value={form.service} onChange={e => set("service", e.target.value)} placeholder="Ex: Terraplenagem - Corte e Aterro" />
          </div>

          <div>
            <Label>Unidade de Medida *</Label>
            <Select value={form.unit} onValueChange={v => set("unit", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data da Medição</Label>
            <Input type="date" value={form.measurement_date} onChange={e => set("measurement_date", e.target.value)} />
          </div>

          <div>
            <Label>Qtd Contratada</Label>
            <Input type="number" value={form.contracted_qty} onChange={e => set("contracted_qty", e.target.value)} placeholder="0" />
          </div>

          <div>
            <Label>Qtd Executada</Label>
            <Input type="number" value={form.executed_qty} onChange={e => set("executed_qty", e.target.value)} placeholder="0" />
          </div>

          <div>
            <Label>Valor Unitário (R$)</Label>
            <Input type="number" value={form.unit_price} onChange={e => set("unit_price", e.target.value)} placeholder="0,00" />
          </div>

          <div>
            <Label>Valor Total (automático)</Label>
            <div className="mt-1 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-sm">
              R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div>
          <Label>Observações</Label>
          <Textarea value={form.comments} onChange={e => set("comments", e.target.value)} placeholder="Detalhes adicionais..." />
        </div>

        <div>
          <Label>Evidências Fotográficas</Label>
          <Input type="file" accept="image/*" onChange={handlePhoto} className="mt-1" />
          {uploading && <p className="text-xs text-muted-foreground mt-1">Enviando foto...</p>}
          <div className="flex gap-2 mt-2 flex-wrap">
            {(form.photos || []).map((url, i) => (
              <img key={i} src={url} className="h-16 w-16 object-cover rounded-lg border" alt="" />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={save} disabled={saving || uploading}>
            {saving ? "Salvando..." : isEdit ? "Atualizar" : "Criar Medição"}
          </Button>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
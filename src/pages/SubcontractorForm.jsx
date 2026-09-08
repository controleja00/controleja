import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "../components/PageHeader";

const specialties = ["Terraplenagem", "Drenagem", "Pavimentação", "Demolição", "Alvenaria", "Acabamento", "Estrutura", "Instalações", "Limpeza pós-obra", "Outro"];

export default function SubcontractorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [form, setForm] = useState({ company_name: "", cnpj: "", contact_name: "", phone: "", email: "", specialty: "", city: "", state: "", employee_count: "", has_own_equipment: false, previous_works: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) base44.entities.Subcontractor.get(id).then(d => setForm(d));
  }, [id]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = { ...form, employee_count: Number(form.employee_count) || 0 };
    if (isEdit) await base44.entities.Subcontractor.update(id, data);
    else await base44.entities.Subcontractor.create(data);
    navigate("/subcontractors");
  };

  return (
    <div>
      <PageHeader title={isEdit ? "Editar Subempreiteiro" : "Novo Subempreiteiro"} />
      <div className="p-6 max-w-2xl space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Nome da Empresa *</Label><Input value={form.company_name} onChange={e => set("company_name", e.target.value)} /></div>
          <div><Label>CNPJ *</Label><Input value={form.cnpj} onChange={e => set("cnpj", e.target.value)} /></div>
          <div><Label>Responsável *</Label><Input value={form.contact_name} onChange={e => set("contact_name", e.target.value)} /></div>
          <div><Label>Telefone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
          <div><Label>E-mail</Label><Input value={form.email} onChange={e => set("email", e.target.value)} /></div>
          <div><Label>Especialidade *</Label>
            <Select value={form.specialty} onValueChange={v => set("specialty", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Cidade</Label><Input value={form.city} onChange={e => set("city", e.target.value)} /></div>
          <div><Label>Estado</Label><Input value={form.state} onChange={e => set("state", e.target.value)} /></div>
          <div><Label>Nº de Funcionários</Label><Input type="number" value={form.employee_count} onChange={e => set("employee_count", e.target.value)} /></div>
        </div>
        <div><Label>Obras Anteriores</Label><Textarea value={form.previous_works} onChange={e => set("previous_works", e.target.value)} /></div>
        <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        <div className="flex gap-3">
          <Button onClick={save} disabled={saving || !form.company_name || !form.cnpj || !form.contact_name || !form.specialty}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/subcontractors")}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
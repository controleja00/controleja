import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

function parseBRL(str) {
  return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatBRL(value) {
  if (!value && value !== 0) return "";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EditRevenueModal({ open, onClose, project, onSaved }) {
  const [rawValue, setRawValue] = useState(
    project.contracted_value ? formatBRL(project.contracted_value) : ""
  );
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  const handleInput = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) { setRawValue(""); return; }
    const num = parseInt(digits, 10) / 100;
    setRawValue(formatBRL(num));
  };

  const handleSave = async () => {
    const value = parseBRL(rawValue);
    if (value < 0) { toast.error("Informe um valor válido."); return; }
    setSaving(true);
    await base44.entities.Project.update(project.id, { contracted_value: value });
    setSaving(false);
    toast.success("Receita contratada atualizada com sucesso.");
    onSaved({ ...project, contracted_value: value });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Receita Contratada
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div>
            <Label className="text-sm font-semibold">Valor (R$)</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">R$</span>
              <Input
                className="pl-9 text-lg font-bold"
                placeholder="0,00"
                value={rawValue}
                onChange={handleInput}
                inputMode="numeric"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Observação (opcional)</Label>
            <Input
              className="mt-1.5"
              placeholder="Ex: Contrato assinado em 04/06/2026"
              value={obs}
              onChange={e => setObs(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !rawValue}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
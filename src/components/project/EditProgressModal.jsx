import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditProgressModal({ open, onClose, project, onSaved }) {
  const [pct, setPct] = useState(project.progress_percent ?? 0);
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNumChange = (e) => {
    const v = Math.min(100, Math.max(0, Number(e.target.value) || 0));
    setPct(v);
  };

  const handleSave = async () => {
    if (pct < 0 || pct > 100) { toast.error("O progresso deve estar entre 0% e 100%."); return; }
    setSaving(true);
    const prev = project.progress_percent ?? 0;
    const me = await base44.auth.me();
    await Promise.all([
      base44.entities.Project.update(project.id, { progress_percent: pct }),
      base44.entities.ProgressHistory.create({
        project_id: project.id,
        project_name: project.name,
        previous_percent: prev,
        new_percent: pct,
        observation: obs,
        responsible: me?.full_name || me?.email || "Responsável",
      }),
    ]);
    setSaving(false);
    toast.success("Progresso da obra atualizado com sucesso.");
    onSaved({ ...project, progress_percent: pct });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Progresso Físico da Obra
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-1">
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-5xl font-black text-primary">{pct}<span className="text-2xl">%</span></p>
            <p className="text-xs text-muted-foreground mt-1">Progresso físico manual</p>
          </div>
          <div>
            <Slider
              min={0} max={100} step={1}
              value={[pct]}
              onValueChange={([v]) => setPct(v)}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Valor exato (%)</Label>
            <Input
              type="number" min={0} max={100}
              className="mt-1.5 text-center text-lg font-bold"
              value={pct}
              onChange={handleNumChange}
              inputMode="numeric"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold">Observação da atualização (opcional)</Label>
            <Input
              className="mt-1.5"
              placeholder='Ex: "Alvenaria do térreo finalizada"'
              value={obs}
              onChange={e => setObs(e.target.value)}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Você pode atualizar manualmente o progresso da obra a qualquer momento.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar Progresso"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
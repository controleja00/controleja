import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Archive, Trash2, Loader2 } from "lucide-react";

export default function ProjDeleteDialog({ project, open, onOpenChange, onArchived }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("choice"); // choice | confirm-archive | confirm-delete
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setStep("choice"); setNameInput(""); };

  const handleClose = () => { reset(); onOpenChange(false); };

  const archiveProject = async () => {
    setLoading(true);
    await base44.entities.Project.update(project.id, { status: "Arquivada" });
    await base44.entities.AuditLog.create({
      action: "Obra arquivada",
      entity_type: "Project",
      entity_id: project.id,
      entity_name: project.name,
      details: `Obra "${project.name}" foi arquivada pelo usuário.`,
      risk_level: "Médio",
    });
    setLoading(false);
    handleClose();
    if (onArchived) onArchived();
    else navigate("/projects");
  };

  const deleteProject = async () => {
    if (nameInput.trim() !== project.name.trim() || loading) return;
    setLoading(true);
    // Cascade delete related records
    const [measurements, cashflow, alerts] = await Promise.all([
      base44.entities.Measurement.filter({ project_id: project.id }),
      base44.entities.CashFlowEntry.filter({ project_id: project.id }),
      base44.entities.Alert.filter({ related_id: project.id }),
    ]);
    await Promise.all([
      ...measurements.map(m => base44.entities.Measurement.delete(m.id)),
      ...cashflow.map(c => base44.entities.CashFlowEntry.delete(c.id)),
      ...alerts.map(a => base44.entities.Alert.delete(a.id)),
    ]);
    try {
      await base44.entities.AuditLog.create({
        action: "Obra excluída permanentemente",
        entity_type: "Project",
        entity_id: project.id,
        entity_name: project.name,
        details: `Obra "${project.name}" foi EXCLUÍDA permanentemente com todos os dados vinculados.`,
        risk_level: "Crítico",
      });
    } catch (_) {}
    try {
      await base44.entities.Project.delete(project.id);
    } catch (_) {}
    setLoading(false);
    handleClose();
    navigate("/projects");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Gerenciar Obra
          </DialogTitle>
        </DialogHeader>

        {step === "choice" && (
          <div className="space-y-3 pt-1">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-sm font-bold">{project.name}</p>
              <p className="text-xs text-muted-foreground">{project.client}</p>
            </div>

            <button
              onClick={() => setStep("confirm-archive")}
              className="w-full flex items-start gap-4 p-4 border border-amber-200 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-200 flex items-center justify-center shrink-0">
                <Archive className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="font-bold text-sm text-amber-900">Arquivar obra</p>
                <p className="text-xs text-amber-700 mt-0.5">Remove da lista principal mas mantém todo o histórico. Pode ser restaurada.</p>
              </div>
            </button>

            <button
              onClick={() => setStep("confirm-delete")}
              className="w-full flex items-start gap-4 p-4 border border-red-200 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-red-200 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="font-bold text-sm text-red-900">Excluir permanentemente</p>
                <p className="text-xs text-red-700 mt-0.5">Apaga a obra e todos os dados vinculados. Esta ação não pode ser desfeita.</p>
              </div>
            </button>
          </div>
        )}

        {step === "confirm-archive" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <Archive className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">A obra <strong>{project.name}</strong> será arquivada e removida da lista principal. O histórico será mantido.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("choice")} className="flex-1">Voltar</Button>
              <Button onClick={archiveProject} disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Arquivamento"}
              </Button>
            </div>
          </div>
        )}

        {step === "confirm-delete" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">Esta ação não pode ser desfeita.</p>
                <p className="text-xs text-red-700 mt-1">Serão excluídos: medições, fluxo de caixa, alertas e todos os dados vinculados a esta obra.</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Digite o nome da obra para confirmar: <strong>{project.name}</strong></p>
              <Input
                placeholder={project.name}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="border-red-200 focus:border-red-500"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("choice")} className="flex-1">Voltar</Button>
              <Button
                onClick={deleteProject}
                disabled={loading || nameInput.trim() !== project.name.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-1.5" />Excluir Permanentemente</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
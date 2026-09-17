import { useState } from "react";
import { consuobra } from "@/api/consuobraClient";
import { AlertTriangle, Camera, X, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const today = () => new Date().toISOString().split("T")[0];

export default function DailyPhotoUpload({ project, user, onSaved }) {
  const [form, setForm] = useState({ report_date: today(), phase: "", observation: "", visible_to_client: true });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const hasContent = photos.length > 0 || form.observation.trim().length > 0 || aiReport.trim().length > 0;

  const handleFiles = async (files) => {
    const images = Array.from(files || []).filter(file => file.type.startsWith("image/"));
    if (images.length === 0) return;

    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of images.slice(0, Math.max(0, 12 - photos.length))) {
        const { file_url } = await consuobra.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
      }
      setPhotos(p => [...p, ...uploaded]);
      if (images.length + photos.length > 12) {
        setError("Foram adicionadas até 12 fotos por relatório para manter o portal rápido.");
      }
    } catch {
      setError("Não foi possível enviar as fotos agora. Tente novamente em instantes.");
    } finally {
      setUploading(false);
    }
  };

  const generateReport = async () => {
    if (!photos.length && !form.observation.trim()) {
      setError("Adicione pelo menos uma foto ou uma observação para gerar um relatório.");
      return;
    }

    setGenerating(true);
    setError("");
    const prompt = `Você é um engenheiro civil experiente analisando fotos de obra e o relato do responsável.

Projeto: ${project.name}
Etapa atual: ${form.phase || "Não informada"}
Data: ${form.report_date}
Observação do responsável: ${form.observation || "Sem observação."}
Fotos enviadas: ${photos.length} foto(s)

Gere um relatório diário da obra com os seguintes tópicos:
1. Resumo do que evoluiu na obra
2. Etapas identificadas
3. Serviços aparentemente executados
4. Pontos de atenção
5. Próximos passos sugeridos

Regras obrigatórias:
- Seja objetivo, técnico e claro para o cliente final.
- Não invente serviços, números, prazos ou problemas que não apareçam nas fotos ou na observação.
- Quando não houver evidência suficiente, escreva "não foi possível confirmar pelas informações enviadas".
- Termine com uma observação curta dizendo que a análise precisa ser validada pela equipe responsável.`;

    try {
      const result = await consuobra.integrations.Core.InvokeLLM({
        prompt,
        file_urls: photos.slice(0, 5),
      });
      setAiReport(typeof result === "string" ? result : JSON.stringify(result, null, 2));
    } catch {
      setError("Não foi possível gerar o relatório com IA agora.");
    } finally {
      setGenerating(false);
    }
  };

  const save = async (status = "Rascunho") => {
    if (!hasContent) {
      setError("Inclua foto, observação ou relatório antes de salvar.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await consuobra.entities.DailyReport.create({
        project_id: project.id,
        project_name: project.name,
        report_date: form.report_date,
        phase: form.phase,
        observation: form.observation,
        visible_to_client: status === "Publicado" ? true : form.visible_to_client,
        photos,
        ai_report: aiReport,
        status,
        sent_by: user?.full_name || user?.email || "Gestor",
      });
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setPhotos([]);
        setAiReport("");
        setForm({ report_date: today(), phase: "", observation: "", visible_to_client: true });
        onSaved();
      }, 1500);
    } catch {
      setError("Não foi possível salvar este relatório. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      <p className="font-bold text-gray-900">Enviado com sucesso!</p>
    </div>
  );

  const phases = project.phases?.map(p => p.name).filter(Boolean) || [];
  const inputCls = "cj-native-input text-sm";
  const selectCls = "cj-native-select text-sm";

  return (
    <div className="space-y-5">
      {/* Date + Phase */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Data *</label>
          <input type="date" value={form.report_date} onChange={e => set("report_date", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Etapa</label>
          {phases.length > 0 ? (
            <select value={form.phase} onChange={e => set("phase", e.target.value)} className={selectCls}>
              <option value="">Selecione</option>
              {phases.map(ph => <option key={ph} value={ph}>{ph}</option>)}
            </select>
          ) : (
            <input placeholder="Ex: Alvenaria" value={form.phase} onChange={e => set("phase", e.target.value)} className={inputCls} />
          )}
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-2 block">Fotos do dia</label>
        <label className="cj-upload-zone flex h-28 cursor-pointer flex-col items-center justify-center gap-2">
          {uploading ? <Loader2 className="h-6 w-6 text-[#8096bc] animate-spin" /> : <Camera className="h-7 w-7 text-[#8096bc]" />}
          <span className="text-sm text-gray-400">{uploading ? "Enviando..." : "Toque para adicionar fotos"}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} disabled={uploading} />
        </label>
        {photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {photos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))} className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] text-gray-400">Limite recomendado: até 12 fotos por atualização.</p>
      </div>

      {/* Observation */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Observação do responsável</label>
        <textarea value={form.observation} onChange={e => set("observation", e.target.value)} rows={3} placeholder="Descreva o que foi feito hoje na obra..." className="cj-native-textarea text-sm" />
      </div>

      {/* Visibility */}
      <div className="flex items-center justify-between bg-secondary rounded-xl px-4 py-3 border border-border">
        <div>
          <p className="text-sm font-semibold text-gray-800">Visível para o cliente</p>
          <p className="text-xs text-gray-500">Fotos e observação aparecem no portal</p>
        </div>
        <button onClick={() => set("visible_to_client", !form.visible_to_client)} className={`h-7 w-12 rounded-full transition-colors ${form.visible_to_client ? "bg-primary" : "bg-gray-300"}`}>
          <div className={`h-5 w-5 bg-white rounded-full shadow transition-all mx-1 ${form.visible_to_client ? "translate-x-5" : "translate-x-0"}`} />
        </button>
      </div>

      {/* AI Report */}
      {(photos.length > 0 || form.observation) && !aiReport && (
        <Button onClick={generateReport} disabled={generating} variant="outline" className="w-full gap-2 border-violet-200 text-violet-700 hover:bg-violet-50">
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando relatório...</> : <><Sparkles className="h-4 w-4" /> Gerar Relatório com IA</>}
        </Button>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {aiReport && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <p className="text-sm font-bold text-violet-700">Relatório gerado pela IA</p>
          </div>
          <textarea value={aiReport} onChange={e => setAiReport(e.target.value)} rows={8} className="cj-native-textarea min-h-[180px] text-xs leading-relaxed" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button onClick={() => save("Rascunho")} disabled={saving || uploading || generating || !hasContent} variant="outline" className="flex-1">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Rascunho"}
        </Button>
        <Button onClick={() => save(form.visible_to_client ? "Publicado" : "Revisado")} disabled={saving || uploading || generating || !hasContent} className="flex-1 bg-primary hover:bg-[#172441] gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : form.visible_to_client ? "Publicar para Cliente" : "Salvar Revisado"}
        </Button>
      </div>
    </div>
  );
}

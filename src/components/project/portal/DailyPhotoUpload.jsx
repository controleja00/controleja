import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, X, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
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

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleFiles = async (files) => {
    setUploading(true);
    const uploaded = [];
    for (const file of Array.from(files)) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    setPhotos(p => [...p, ...uploaded]);
    setUploading(false);
  };

  const generateReport = async () => {
    setGenerating(true);
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

Seja objetivo e técnico. Ao final, adicione a nota: "⚠️ Esta análise é gerada por inteligência artificial com base nas informações fornecidas e pode precisar de validação pela equipe técnica."`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: photos.slice(0, 5),
    });
    setAiReport(typeof result === "string" ? result : JSON.stringify(result));
    setGenerating(false);
  };

  const save = async (status = "Rascunho") => {
    setSaving(true);
    await base44.entities.DailyReport.create({
      project_id: project.id,
      project_name: project.name,
      report_date: form.report_date,
      phase: form.phase,
      observation: form.observation,
      visible_to_client: form.visible_to_client,
      photos,
      ai_report: aiReport,
      status,
      sent_by: user?.full_name || user?.email || "Gestor",
    });
    setSaving(false);
    setDone(true);
    setTimeout(() => { setDone(false); setPhotos([]); setAiReport(""); setForm({ report_date: today(), phase: "", observation: "", visible_to_client: true }); onSaved(); }, 1500);
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      <p className="font-bold text-gray-900">Enviado com sucesso!</p>
    </div>
  );

  const phases = project.phases?.map(p => p.name).filter(Boolean) || [];
  const inputCls = "w-full rounded-xl px-3 py-2 text-sm outline-none border border-gray-200 bg-gray-50 focus:border-primary transition-colors";

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
            <select value={form.phase} onChange={e => set("phase", e.target.value)} className={inputCls}>
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
        <label className="flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-secondary transition-colors bg-white">
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
      </div>

      {/* Observation */}
      <div>
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Observação do responsável</label>
        <textarea value={form.observation} onChange={e => set("observation", e.target.value)} rows={3} placeholder="Descreva o que foi feito hoje na obra..." className={inputCls + " resize-none"} />
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

      {aiReport && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <p className="text-sm font-bold text-violet-700">Relatório gerado pela IA</p>
          </div>
          <textarea value={aiReport} onChange={e => setAiReport(e.target.value)} rows={8} className="w-full text-xs text-gray-700 bg-transparent outline-none resize-none leading-relaxed" />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button onClick={() => save("Rascunho")} disabled={saving} variant="outline" className="flex-1">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Rascunho"}
        </Button>
        <Button onClick={() => save("Publicado")} disabled={saving} className="flex-1 bg-primary hover:bg-[#172441] gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar para Cliente"}
        </Button>
      </div>
    </div>
  );
}
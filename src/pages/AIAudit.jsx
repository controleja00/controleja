import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, AlertTriangle, CheckCircle2, Loader2, Eye } from "lucide-react";
import PageHeader from "../components/PageHeader";

export default function AIAudit() {
  const [photos, setPhotos] = useState([]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    const urls = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f }).then(r => r.file_url)));
    setPhotos(prev => [...prev, ...urls]);
    setLoading(false);
  };

  const analyze = async () => {
    if (photos.length === 0) return;
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em auditoria visual de obras de construção civil. Analise as imagens enviadas e forneça um relatório detalhado em português. Contexto adicional: ${context || "Nenhum"}.
      
      Avalie:
      1. Avanço físico estimado (%)
      2. Qualidade aparente dos serviços
      3. Uso correto de EPIs pelos trabalhadores
      4. Organização e limpeza do canteiro
      5. Possíveis não conformidades ou defeitos visíveis
      6. Risco de atraso
      7. Pontos críticos de atenção
      8. Sugestões de correção
      
      Classifique o risco geral como: Baixo, Médio, Alto ou Crítico.`,
      file_urls: photos,
      response_json_schema: {
        type: "object",
        properties: {
          risk_level: { type: "string" },
          physical_progress: { type: "number" },
          quality_score: { type: "number" },
          epi_compliance: { type: "string" },
          site_organization: { type: "string" },
          critical_points: { type: "array", items: { type: "string" } },
          suggestions: { type: "array", items: { type: "string" } },
          summary: { type: "string" },
          delay_risk: { type: "string" }
        }
      }
    });
    setResult(res);
    setLoading(false);
  };

  const riskColor = { "Baixo": "text-emerald-600 bg-emerald-50", "Médio": "text-amber-600 bg-amber-50", "Alto": "text-orange-600 bg-orange-50", "Crítico": "text-red-600 bg-red-50" };

  return (
    <div>
      <PageHeader title="Auditoria Visual com IA" subtitle="Envie fotos da obra para análise automática por inteligência artificial" />
      <div className="p-6 max-w-4xl space-y-6">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">1. Envie fotos da obra</h3>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Selecione fotos ou vídeos da obra</p>
            <label><Button variant="outline" className="cursor-pointer" asChild><span><Upload className="h-4 w-4 mr-2" />Selecionar Arquivos</span></Button><input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} /></label>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {photos.map((url, i) => <img key={i} src={url} className="h-20 w-full object-cover rounded-lg border" />)}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-sm">2. Contexto adicional (opcional)</h3>
          <Textarea placeholder="Ex: Pavimentação da via principal, etapa de base, equipe de 8 pessoas..." value={context} onChange={e => setContext(e.target.value)} rows={3} />
        </div>

        <Button onClick={analyze} disabled={loading || photos.length === 0} className="w-full" size="lg">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando com IA...</> : <><Eye className="h-4 w-4 mr-2" />Analisar Obra com IA</>}
        </Button>

        {result && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Relatório de Auditoria Visual</h3>
              <span className={`font-bold text-sm px-3 py-1 rounded-full ${riskColor[result.risk_level] || "bg-gray-100 text-gray-700"}`}>Risco: {result.risk_level}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{result.physical_progress || 0}%</p>
                <p className="text-xs text-muted-foreground">Avanço Físico</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{result.quality_score || 0}/10</p>
                <p className="text-xs text-muted-foreground">Qualidade</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm font-bold text-foreground">{result.delay_risk || "—"}</p>
                <p className="text-xs text-muted-foreground">Risco de Atraso</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Resumo</p>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>

            {result.critical_points?.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-red-500" />Pontos Críticos</p>
                <ul className="space-y-1">{result.critical_points.map((p, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span>{p}</li>)}</ul>
              </div>
            )}

            {result.suggestions?.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Sugestões</p>
                <ul className="space-y-1">{result.suggestions.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span>{s}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
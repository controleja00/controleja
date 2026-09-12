import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "../components/PageHeader";

export default function AntiFraud() {
  const [measurements, setMeasurements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setLoading(true);
    base44.auth.me().then((me) => base44.entities.Measurement.filter({ created_by_id: me.id }, "-created_date", 50)).then(d => {
      setMeasurements(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    try {
      const urls = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f }).then(r => r.file_url)));
      setPhotos(prev => [...prev, ...urls]);
    } catch {
      setResult({ overall_risk: "Erro", fraud_probability: 0, anomalies: [], summary: "Não foi possível enviar uma ou mais fotos. Tente novamente." });
    }
    setLoading(false);
  };

  const analyze = async () => {
    setAnalyzing(true);
    setResult(null);

    const measurementSummary = measurements.slice(0, 20).map(m => ({
      project: m.project_name,
      sub: m.subcontractor_name,
      service: m.service,
      qty: m.executed_qty,
      unit: m.unit,
      value: m.total_value,
      status: m.status,
      date: m.measurement_date
    }));

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em detecção de fraudes em obras de construção civil. Analise os dados de medições e imagens fornecidos.

Medições recentes: ${JSON.stringify(measurementSummary)}
Contexto adicional: ${context || "Nenhum"}

Verifique:
1. Medições com valores discrepantes ou acima do padrão
2. Produtividade incompatível com o tamanho da equipe
3. Padrões suspeitos de faturamento (valores muito altos seguidos de períodos sem atividade)
4. Inconsistências de datas
5. Se há imagens: analise qualidade, possível manipulação, localização suspeita
6. Riscos de retrabalho disfarçado como novo serviço

Para cada suspeita, classifique o risco como: Baixo, Médio, Alto ou Crítico.`,
      file_urls: photos.length > 0 ? photos : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          overall_risk: { type: "string" },
          fraud_probability: { type: "number" },
          anomalies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                description: { type: "string" },
                risk_level: { type: "string" },
                affected: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          suspicious_measurements: { type: "array", items: { type: "string" } },
          clean_measurements_count: { type: "number" },
          summary: { type: "string" }
        }
      }
    });

    setResult(res);
    setHistory(prev => [{ date: new Date().toLocaleString("pt-BR"), risk: res.overall_risk, anomalies: res.anomalies?.length || 0 }, ...prev.slice(0, 4)]);
    setAnalyzing(false);
  };

  const riskColor = {
    "Baixo": "text-emerald-600 bg-emerald-50 border-emerald-200",
    "Médio": "text-amber-600 bg-amber-50 border-amber-200",
    "Alto": "text-orange-600 bg-orange-50 border-orange-200",
    "Crítico": "text-red-600 bg-red-50 border-red-200"
  };

  return (
    <div>
      <PageHeader title="Sistema Anti-Fraude" subtitle="Detecção automática de inconsistências operacionais e fraudes em medições" />
      <div className="p-6 max-w-4xl space-y-6">

        {history.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">ANÁLISES RECENTES</p>
            <div className="flex gap-3 overflow-x-auto">
              {history.map((h, i) => (
                <div key={i} className="shrink-0 bg-muted/40 rounded-lg px-3 py-2 text-xs">
                  <p className="font-medium">{h.date}</p>
                  <p className="text-muted-foreground">{h.anomalies} anomalia(s) · <span className={h.risk === "Crítico" ? "text-red-600" : h.risk === "Alto" ? "text-orange-600" : "text-emerald-600"}>{h.risk}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Upload className="h-4 w-4" />Evidências Fotográficas (opcional)</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Envie fotos de medições para análise visual</p>
            <label>
              <Button variant="outline" size="sm" asChild><span>Selecionar fotos</span></Button>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </label>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((url, i) => <img key={i} src={url} className="h-16 w-full object-cover rounded-lg border" />)}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-sm">Contexto (opcional)</h3>
          <Textarea placeholder="Descreva a situação específica que deseja investigar..." value={context} onChange={e => setContext(e.target.value)} rows={2} />
        </div>

        <div className="bg-secondary border border-border rounded-xl p-4 flex gap-3">
          <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-primary">A IA analisará automaticamente as últimas <strong>{measurements.length} medições</strong> cadastradas em busca de padrões suspeitos, inconsistências e possíveis fraudes.</p>
        </div>

        <Button onClick={analyze} disabled={analyzing || loading} className="w-full" size="lg">
          {analyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando fraudes...</> : <><ShieldAlert className="h-4 w-4 mr-2" />Executar Análise Anti-Fraude</>}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className={`border rounded-xl p-4 text-center ${riskColor[result.overall_risk] || "bg-card border-border"}`}>
                <p className="text-2xl font-black">{result.overall_risk}</p>
                <p className="text-xs opacity-70 mt-0.5">Risco Geral</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-primary">{result.fraud_probability || 0}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Prob. de Fraude</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-red-600">{result.anomalies?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Anomalias Detectadas</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold mb-2">Resumo da Análise</p>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>

            {result.anomalies?.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />Anomalias Detectadas</h3>
                </div>
                <div className="divide-y divide-border">
                  {result.anomalies.map((a, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm">{a.type}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${riskColor[a.risk_level] || ""}`}>{a.risk_level}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{a.description}</p>
                      {a.affected && <p className="text-xs text-foreground/60"><span className="font-medium">Afetado:</span> {a.affected}</p>}
                      {a.recommendation && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-emerald-700">{a.recommendation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.anomalies?.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800">Nenhuma anomalia detectada</p>
                  <p className="text-sm text-emerald-700">As medições analisadas estão dentro dos padrões esperados.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

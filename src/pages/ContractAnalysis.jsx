import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, AlertTriangle, CheckCircle2, Upload, Scale } from "lucide-react";
import PageHeader from "../components/PageHeader";

export default function ContractAnalysis() {
  const [contractText, setContractText] = useState("");
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setFileUrl(file_url);
    setUploading(false);
  };

  const analyze = async () => {
    if (!contractText && !fileUrl) return;
    setAnalyzing(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um advogado especialista em contratos de construção civil e direito trabalhista brasileiro. Analise o contrato abaixo em detalhes.

${contractText ? `Texto do contrato:\n${contractText}` : "Analise o documento anexo."}

Identifique:
1. Cláusulas de risco para o subempreiteiro (retenções abusivas, prazo de pagamento excessivo, multas desproporcionais)
2. Risco de vínculo empregatício / reconhecimento CLT
3. Responsabilidades excessivas transferidas ao subempreiteiro
4. Ausência de cláusulas de proteção essenciais
5. Cláusulas de rescisão unilateral prejudiciais
6. Condições de medição e aprovação injustas
7. Garantias e seguros exigidos
8. Pontos positivos do contrato

Classifique cada problema como risco Baixo, Médio, Alto ou Crítico.
Gere um score contratual de 0 a 100 (100 = totalmente seguro para o subempreiteiro).`,
      file_urls: fileUrl ? [fileUrl] : undefined,
      response_json_schema: {
        type: "object",
        properties: {
          contract_score: { type: "number" },
          overall_risk: { type: "string" },
          clt_risk: { type: "string" },
          summary: { type: "string" },
          dangerous_clauses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                clause: { type: "string" },
                risk_level: { type: "string" },
                description: { type: "string" },
                recommendation: { type: "string" }
              }
            }
          },
          missing_protections: { type: "array", items: { type: "string" } },
          positive_points: { type: "array", items: { type: "string" } },
          legal_recommendation: { type: "string" }
        }
      }
    });

    setResult(res);
    setAnalyzing(false);
  };

  const scoreColor = (s) => {
    if (s >= 75) return "text-emerald-600";
    if (s >= 50) return "text-amber-600";
    if (s >= 30) return "text-orange-600";
    return "text-red-600";
  };

  const riskColor = {
    "Baixo": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Médio": "bg-amber-50 text-amber-700 border-amber-200",
    "Alto": "bg-orange-50 text-orange-700 border-orange-200",
    "Crítico": "bg-red-50 text-red-700 border-red-200"
  };

  return (
    <div>
      <PageHeader title="IA de Análise de Contratos" subtitle="Análise jurídica automática de contratos de subempreitada" />
      <div className="p-6 max-w-4xl space-y-6">

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Upload className="h-4 w-4" />Enviar Contrato (PDF ou imagem)</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-5 text-center">
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {fileUrl && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">PDF, imagem ou foto do contrato</p>
                <label>
                  <Button variant="outline" size="sm" asChild><span>Selecionar arquivo</span></Button>
                  <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFile} />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Ou cole o texto do contrato</h3>
          <Textarea placeholder="Cole aqui o texto do contrato para análise..." value={contractText} onChange={e => setContractText(e.target.value)} rows={8} className="font-mono text-xs" />
        </div>

        <Button onClick={analyze} disabled={analyzing || uploading || (!contractText && !fileUrl)} className="w-full" size="lg">
          {analyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando contrato...</> : <><Scale className="h-4 w-4 mr-2" />Analisar Contrato com IA</>}
        </Button>

        {result && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <p className={`text-4xl font-black ${scoreColor(result.contract_score || 0)}`}>{result.contract_score || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Score Contratual /100</p>
              </div>
              <div className={`border rounded-xl p-4 text-center ${riskColor[result.overall_risk] || "bg-card border-border"}`}>
                <p className="text-xl font-bold">{result.overall_risk}</p>
                <p className="text-xs opacity-70 mt-0.5">Risco Geral</p>
              </div>
              <div className={`border rounded-xl p-4 text-center ${riskColor[result.clt_risk] || "bg-card border-border"}`}>
                <p className="text-sm font-bold">{result.clt_risk || "—"}</p>
                <p className="text-xs opacity-70 mt-0.5">Risco Trabalhista/CLT</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold mb-2">Resumo Jurídico</p>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>

            {result.dangerous_clauses?.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-red-50/50">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-red-700"><AlertTriangle className="h-4 w-4" />Cláusulas de Risco ({result.dangerous_clauses.length})</h3>
                </div>
                <div className="divide-y divide-border">
                  {result.dangerous_clauses.map((c, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm">{c.clause}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${riskColor[c.risk_level] || ""}`}>{c.risk_level}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{c.description}</p>
                      {c.recommendation && <p className="text-xs text-blue-700 flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5 text-blue-500" />{c.recommendation}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {result.missing_protections?.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm font-semibold mb-2 text-orange-700">⚠️ Proteções Ausentes</p>
                  <ul className="space-y-1">{result.missing_protections.map((m, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-orange-400">•</span>{m}</li>)}</ul>
                </div>
              )}
              {result.positive_points?.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm font-semibold mb-2 text-emerald-700">✅ Pontos Positivos</p>
                  <ul className="space-y-1">{result.positive_points.map((p, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-emerald-400">•</span>{p}</li>)}</ul>
                </div>
              )}
            </div>

            {result.legal_recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <Scale className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">{result.legal_recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScoreBadge from "../components/ScoreBadge";
import PageHeader from "../components/PageHeader";

const SPECIALTIES = ["Terraplenagem", "Drenagem", "Pavimentação", "Demolição", "Alvenaria", "Acabamento", "Estrutura", "Instalações", "Limpeza pós-obra"];

export default function Recommendations() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ specialty: "", region: "", budget: "", priority: "melhor custo-benefício" });

  useEffect(() => {
    base44.auth.me().then((me) => base44.entities.Subcontractor.filter({ created_by_id: me.id }))
      .then(d => { setSubs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const recommend = async () => {
    setAnalyzing(true);
    setResult(null);

    const pool = subs.filter(s =>
      s.status === "Ativo" &&
      (!form.specialty || s.specialty === form.specialty) &&
      (!form.region || s.city?.toLowerCase().includes(form.region.toLowerCase()) || s.state?.toLowerCase().includes(form.region.toLowerCase()))
    );

    const summary = pool.map(s => ({
      id: s.id,
      name: s.company_name,
      specialty: s.specialty,
      city: s.city,
      state: s.state,
      score: s.score_total,
      score_op: s.score_operational,
      score_tech: s.score_technical,
      score_legal: s.score_legal,
      score_financial: s.score_financial,
      score_behavioral: s.score_behavioral,
      availability: s.availability,
      employees: s.employee_count
    }));

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um motor de recomendação para gestão de subempreiteiros de construção civil. Analise a lista de subempreiteiros disponíveis e recomende os melhores para o projeto.

Especialidade desejada: ${form.specialty || "qualquer"}
Região: ${form.region || "qualquer"}
Orçamento disponível: ${form.budget ? `R$ ${form.budget}` : "não informado"}
Prioridade: ${form.priority}

Subempreiteiros disponíveis: ${JSON.stringify(summary)}

Recomende os TOP 3 subempreiteiros justificando cada escolha. Considere score total, scores individuais, disponibilidade e especialidade.
Para cada recomendação, forneça: ID, nome, score, pontos fortes, pontos de atenção e por que é a melhor escolha para este perfil.`,
      response_json_schema: {
        type: "object",
        properties: {
          total_analyzed: { type: "number" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                rank: { type: "number" },
                why: { type: "string" },
                strengths: { type: "array", items: { type: "string" } },
                warnings: { type: "array", items: { type: "string" } },
                fit_score: { type: "number" }
              }
            }
          },
          analysis_summary: { type: "string" }
        }
      }
    });

    setResult(res);
    setAnalyzing(false);
  };

  const getSubById = (id) => subs.find(s => s.id === id);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Motor de Recomendação" subtitle="IA que recomenda os melhores subempreiteiros para o seu projeto" />
      <div className="p-6 max-w-4xl space-y-6">

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-sm">Parâmetros do Projeto</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Especialidade necessária</Label>
              <Select value={form.specialty || "all"} onValueChange={v => set("specialty", v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Região / Cidade</Label>
              <Input value={form.region} onChange={e => set("region", e.target.value)} placeholder="Ex: São Paulo, GO..." />
            </div>
            <div>
              <Label>Orçamento (R$)</Label>
              <Input type="number" value={form.budget} onChange={e => set("budget", e.target.value)} placeholder="Opcional" />
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="melhor custo-benefício">Melhor custo-benefício</SelectItem>
                  <SelectItem value="maior score técnico">Maior qualidade técnica</SelectItem>
                  <SelectItem value="menor risco jurídico">Menor risco jurídico</SelectItem>
                  <SelectItem value="maior produtividade">Maior produtividade</SelectItem>
                  <SelectItem value="menor risco geral">Menor risco geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button onClick={recommend} disabled={analyzing} className="w-full" size="lg">
          {analyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando {subs.filter(s => s.status === "Ativo").length} subempreiteiros...</> : <><Sparkles className="h-4 w-4 mr-2" />Recomendar Subempreiteiros</>}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{result.analysis_summary}</p>
              <span className="text-xs text-muted-foreground shrink-0">{result.total_analyzed} analisados</span>
            </div>

            {result.recommendations?.map((rec, i) => {
              const sub = getSubById(rec.id);
              return (
                <div key={i} className={`bg-card border-2 rounded-xl p-5 ${i === 0 ? "border-primary" : "border-border"}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-primary text-white" : "bg-muted text-foreground"}`}>{rec.rank}</div>
                      <div>
                        <p className="font-semibold">{rec.name}</p>
                        {sub && <p className="text-xs text-muted-foreground">{sub.specialty} · {sub.city}/{sub.state}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {sub && <ScoreBadge score={sub.score_total} size="sm" />}
                      <div className="text-right">
                        <p className="text-xs font-bold text-primary">{rec.fit_score}%</p>
                        <p className="text-[10px] text-muted-foreground">compatibilidade</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/80 mb-3">{rec.why}</p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {rec.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1"><Star className="h-3 w-3" />Pontos Fortes</p>
                        <ul className="space-y-0.5">{rec.strengths.map((s, j) => <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-emerald-400">•</span>{s}</li>)}</ul>
                      </div>
                    )}
                    {rec.warnings?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-1">⚠ Atenção</p>
                        <ul className="space-y-0.5">{rec.warnings.map((w, j) => <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="text-amber-400">•</span>{w}</li>)}</ul>
                      </div>
                    )}
                  </div>

                  {sub && (
                    <Link to={`/subcontractors/${sub.id}`} className="mt-3 flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      Ver perfil completo <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

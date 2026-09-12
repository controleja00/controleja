import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, MapPin, Calendar, DollarSign, Users, Star, AlertTriangle, CheckCircle2, Loader2, ShieldCheck, TrendingUp, Clock, FileText } from "lucide-react";
import ScoreBadge from "../components/ScoreBadge";
import ReactMarkdown from "react-markdown";

const riskColor = { "Baixo": "text-emerald-600 bg-emerald-50", "Médio": "text-amber-600 bg-amber-50", "Alto": "text-red-600 bg-red-50" };

export default function HiringDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [subcontractors, setSubcontractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const [contracting, setContracting] = useState(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [generatedContract, setGeneratedContract] = useState(null);

  useEffect(() => {
    base44.auth.me().then((me) => Promise.all([
      base44.entities.HiringRequest.get(id),
      base44.entities.Subcontractor.filter({ created_by_id: me.id }),
    ]).then(([r, s]) => {
      if (r?.created_by_id && r.created_by_id !== me.id) {
        setLoading(false);
        navigate("/hiring");
        return;
      }
      setRequest(r);
      setSubcontractors(s);
      setLoading(false);
    })).catch(() => {
      setRequest(null);
      setLoading(false);
    });
  }, [id, navigate]);

  const runAIMatch = async () => {
    setAiLoading(true);
    const candidates = subcontractors.filter(s =>
      s.status !== "Bloqueado" && s.status !== "Inativo" &&
      (s.specialty === request.service_type || !request.service_type || s.specialty === "Outro")
    );

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em contratação de subempreiteiros para construção civil brasileira.

NECESSIDADE DA OBRA:
- Serviço: ${request.service_type}
- Descrição: ${request.description}
- Localização: ${request.location}
- Início previsto: ${request.start_date || "não definido"}
- Prazo: ${request.deadline_days || "?"} dias
- Tamanho: ${request.area_size || "não informado"}
- Orçamento: R$ ${request.estimated_budget?.toLocaleString("pt-BR") || "não informado"}
- Funcionários necessários: ${request.workers_needed || "?"}
- Equipamentos: ${request.equipment_needed || "nenhum"}
- Exigências: ${request.technical_requirements || "padrão"}

CANDIDATOS DISPONÍVEIS:
${JSON.stringify(candidates.map(s => ({
  id: s.id,
  nome: s.company_name,
  especialidade: s.specialty,
  cidade: s.city,
  estado: s.state,
  score_total: s.score_total || 0,
  score_operacional: s.score_operational || 0,
  score_tecnico: s.score_technical || 0,
  score_juridico: s.score_legal || 0,
  score_financeiro: s.score_financial || 0,
  funcionarios: s.employee_count || 0,
  equipamentos_proprios: s.has_own_equipment || false,
  disponibilidade: s.availability,
  status: s.status,
})))}

Analise cada candidato e gere:
1. Ranking dos top 5 melhores para esta necessidade
2. Score de compatibilidade (0-100) para cada um
3. Risco da contratação (Baixo/Médio/Alto) para cada um
4. Principais pontos positivos e negativos de cada um
5. Recomendação geral

Seja preciso, prático e direto.`,
      response_json_schema: {
        type: "object",
        properties: {
          ranking: {
            type: "array",
            items: {
              type: "object",
              properties: {
                subcontractor_id: { type: "string" },
                nome: { type: "string" },
                compatibility_score: { type: "number" },
                risk_level: { type: "string" },
                positives: { type: "array", items: { type: "string" } },
                negatives: { type: "array", items: { type: "string" } },
                recommendation: { type: "string" },
              }
            }
          },
          general_insight: { type: "string" },
          best_cost_benefit: { type: "string" },
          lowest_risk: { type: "string" },
          market_budget_suggestion: { type: "string" },
          estimated_productivity: { type: "string" },
        }
      }
    });
    setMatches(res);
    await base44.entities.HiringRequest.update(id, { status: "Em análise", ai_analysis: res.general_insight });
    setRequest(r => ({ ...r, status: "Em análise", ai_analysis: res.general_insight }));
    setAiLoading(false);
  };

  const generateContract = async (sub) => {
    setContractLoading(true);
    const matchData = matches?.ranking?.find(m => m.subcontractor_id === sub.id);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Gere um CONTRATO DE EMPREITADA completo e profissional em português, baseado nos dados abaixo. Use linguagem jurídica adequada para construção civil brasileira. Inclua todas as cláusulas essenciais.

CONTRATANTE: [Nome da Construtora]
CONTRATADO: ${sub.company_name} - CNPJ: ${sub.cnpj || "a informar"}
RESPONSÁVEL: ${sub.contact_name || "a informar"}

OBJETO DO CONTRATO:
- Serviço: ${request.service_type}
- Descrição: ${request.description}
- Localização: ${request.location}
- Área/Tamanho: ${request.area_size || "conforme projeto"}
- Prazo de execução: ${request.deadline_days || "a definir"} dias corridos

VALORES:
- Orçamento estimado: R$ ${request.estimated_budget?.toLocaleString("pt-BR") || "a definir"}
- Forma de pagamento: Por medição

Inclua obrigatoriamente:
1. Objeto
2. Prazo
3. Valor e forma de pagamento
4. Medições e aprovações
5. Retenção de garantia (5%)
6. Obrigações do contratado
7. Documentação exigida (${request.technical_requirements || "NR-18, ASO, seguro"})
8. Responsabilidade trabalhista
9. Penalidades por atraso
10. Rescisão contratual
11. Foro competente
12. Assinaturas`,
    });
    setGeneratedContract({ content: res, subName: sub.company_name });
    setContractLoading(false);
  };

  const hireSub = async (sub) => {
    setContracting(sub.id);
    await base44.entities.HiringRequest.update(id, {
      status: "Contratado",
      hired_subcontractor_id: sub.id,
      hired_subcontractor_name: sub.company_name,
    });
    if (request.project_id) {
      const project = await base44.entities.Project.get(request.project_id);
      const currentIds = project.subcontractor_ids || [];
      if (!currentIds.includes(sub.id)) {
        await base44.entities.Project.update(request.project_id, {
          subcontractor_ids: [...currentIds, sub.id],
        });
      }
    }
    await base44.entities.Alert.create({
      title: `Empreiteiro contratado: ${sub.company_name}`,
      description: `Serviço: ${request.service_type} · ${request.description}`,
      type: "Outro",
      severity: "Baixa",
      related_entity: "HiringRequest",
      related_id: id,
      is_read: false,
      is_resolved: false,
    });
    setRequest(r => ({ ...r, status: "Contratado", hired_subcontractor_name: sub.company_name }));
    setContracting(null);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  if (!request) return null;

  const matchedSubs = (matches?.ranking || []).map(m => {
    const sub = subcontractors.find(s => s.id === m.subcontractor_id);
    return sub ? { ...sub, ...m } : null;
  }).filter(Boolean);

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-card">
        <button onClick={() => navigate("/hiring")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" />Voltar
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{request.service_type}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${request.status === "Contratado" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{request.status}</span>
            </div>
            <h1 className="text-xl font-bold">{request.description}</h1>
          </div>
          {request.status !== "Contratado" && (
            <Button onClick={runAIMatch} disabled={aiLoading} className="gap-2 shrink-0">
              {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Analisando candidatos...</> : <><Zap className="h-4 w-4" />Buscar com IA</>}
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-w-5xl">
        {/* Request Info */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-3">Detalhes da Necessidade</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {request.location && <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-[10px] text-muted-foreground uppercase font-semibold">Localização</p><p className="font-medium">{request.location}</p></div></div>}
            {request.start_date && <div className="flex items-start gap-2"><Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-[10px] text-muted-foreground uppercase font-semibold">Início</p><p className="font-medium">{request.start_date}{request.deadline_days ? ` · ${request.deadline_days}d` : ""}</p></div></div>}
            {request.estimated_budget > 0 && <div className="flex items-start gap-2"><DollarSign className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-[10px] text-muted-foreground uppercase font-semibold">Orçamento</p><p className="font-medium">R$ {request.estimated_budget.toLocaleString("pt-BR")}</p></div></div>}
            {request.workers_needed > 0 && <div className="flex items-start gap-2"><Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" /><div><p className="text-[10px] text-muted-foreground uppercase font-semibold">Equipe</p><p className="font-medium">{request.workers_needed} pessoas</p></div></div>}
          </div>
          {request.equipment_needed && <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">🔧 {request.equipment_needed}</p>}
          {request.technical_requirements && <p className="text-sm text-muted-foreground mt-1.5">📋 {request.technical_requirements}</p>}
        </div>

        {/* AI General Insight */}
        {matches?.general_insight && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary border border-primary/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <p className="font-semibold text-sm text-primary">Análise Inteligente da IA</p>
            </div>
            <p className="text-sm text-foreground mb-3">{matches.general_insight}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {matches.best_cost_benefit && <div className="bg-white/70 rounded-lg p-3"><p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Melhor Custo-Benefício</p><p className="text-sm font-medium">{matches.best_cost_benefit}</p></div>}
              {matches.lowest_risk && <div className="bg-white/70 rounded-lg p-3"><p className="text-[10px] font-bold text-primary uppercase mb-1">Menor Risco</p><p className="text-sm font-medium">{matches.lowest_risk}</p></div>}
              {matches.market_budget_suggestion && <div className="bg-white/70 rounded-lg p-3"><p className="text-[10px] font-bold text-purple-700 uppercase mb-1">Sugestão de Budget</p><p className="text-sm font-medium">{matches.market_budget_suggestion}</p></div>}
            </div>
          </div>
        )}

        {/* Matched Subcontractors */}
        {matchedSubs.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm">Candidatos Recomendados ({matchedSubs.length})</h2>
            {matchedSubs.map((sub, idx) => (
              <div key={sub.id} className={`bg-card border rounded-xl overflow-hidden ${idx === 0 ? "border-primary/40 shadow-sm" : "border-border"}`}>
                {idx === 0 && <div className="bg-primary px-4 py-1.5 flex items-center gap-2"><Star className="h-3 w-3 text-white fill-white" /><p className="text-xs font-bold text-white">Melhor candidato para esta obra</p></div>}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={sub.score_total} size="md" />
                      <div>
                        <p className="font-bold">{sub.company_name}</p>
                        <p className="text-xs text-muted-foreground">{sub.specialty} · {sub.city}, {sub.state}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">Compatibilidade</p>
                          <p className="text-xl font-black text-primary">{sub.compatibility_score}%</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskColor[sub.risk_level] || "text-gray-600 bg-gray-100"}`}>
                        Risco {sub.risk_level}
                      </span>
                    </div>
                  </div>

                  {/* Compatibility Bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${sub.compatibility_score >= 70 ? "bg-emerald-500" : sub.compatibility_score >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${sub.compatibility_score}%` }} />
                    </div>
                  </div>

                  {/* Score Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: "Operacional", value: sub.score_operational || 0 },
                      { label: "Técnico", value: sub.score_technical || 0 },
                      { label: "Jurídico", value: sub.score_legal || 0 },
                      { label: "Financeiro", value: sub.score_financial || 0 },
                    ].map(s => (
                      <div key={s.label} className="bg-muted/40 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        <p className={`text-sm font-bold ${s.value >= 70 ? "text-emerald-600" : s.value >= 50 ? "text-amber-600" : "text-red-600"}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Positives / Negatives */}
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    {sub.positives?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Pontos Positivos</p>
                        {sub.positives.map((p, i) => <p key={i} className="text-xs text-emerald-700 flex items-start gap-1"><CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />{p}</p>)}
                      </div>
                    )}
                    {sub.negatives?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-700 uppercase mb-1">Pontos de Atenção</p>
                        {sub.negatives.map((n, i) => <p key={i} className="text-xs text-red-700 flex items-start gap-1"><AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />{n}</p>)}
                      </div>
                    )}
                  </div>

                  {sub.recommendation && <p className="text-xs text-muted-foreground italic mb-3 bg-muted/30 rounded-lg p-2">💡 {sub.recommendation}</p>}

                  {/* Extra Info */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                    {sub.employee_count > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{sub.employee_count} funcionários</span>}
                    {sub.has_own_equipment && <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" />Equip. próprios</span>}
                    <span className={`flex items-center gap-1 ${sub.availability === "Disponível" ? "text-emerald-600" : "text-amber-600"}`}>
                      <Clock className="h-3 w-3" />{sub.availability}
                    </span>
                  </div>

                  {/* Actions */}
                  {request.status !== "Contratado" && (
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => generateContract(sub)} disabled={contractLoading}>
                        {contractLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                        Gerar Contrato
                      </Button>
                      <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => hireSub(sub)} disabled={contracting === sub.id}>
                        {contracting === sub.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                        Contratar
                      </Button>
                    </div>
                  )}
                  {request.status === "Contratado" && request.hired_subcontractor_name === sub.company_name && (
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-semibold text-emerald-700">Contratado com sucesso</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generated Contract */}
        {generatedContract && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><p className="font-semibold text-sm">Contrato Gerado — {generatedContract.subName}</p></div>
              <Button variant="outline" size="sm" onClick={() => {
                const el = document.createElement("a");
                el.href = "data:text/plain;charset=utf-8," + encodeURIComponent(generatedContract.content);
                el.download = `contrato-${generatedContract.subName.replace(/\s+/g, "-")}.txt`;
                el.click();
              }}>Exportar</Button>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto">
              <ReactMarkdown className="prose prose-sm max-w-none text-xs leading-relaxed">{generatedContract.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Empty state for AI */}
        {!matches && request.status !== "Contratado" && (
          <div className="bg-card border-2 border-dashed border-primary/20 rounded-xl p-10 flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Pronto para encontrar o melhor empreiteiro</p>
              <p className="text-sm text-muted-foreground mt-1">Clique em "Buscar com IA" para analisar os candidatos e receber um ranking inteligente com score de compatibilidade, análise de risco e recomendação.</p>
            </div>
            <Button onClick={runAIMatch} disabled={aiLoading} className="gap-2 mt-1">
              {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Analisando...</> : <><Zap className="h-4 w-4" />Buscar Candidatos com IA</>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

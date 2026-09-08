import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SUGGESTIONS = [
  "Essa obra vai atrasar?",
  "Qual o maior risco atual?",
  "Qual empreiteiro está pior?",
  "Quais pagamentos são urgentes?",
  "Resumo geral da obra",
];

export default function ProjAIChat({ project, subs, measurements, documents }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const context = `
Obra: ${project.name} | Status: ${project.status} | Progresso: ${project.progress_percent || 0}%
Orçamento: R$ ${project.budget || 0} | Início: ${project.start_date} | Prazo: ${project.expected_end_date}
Subempreiteiros: ${subs.map(s => `${s.company_name}(score:${s.score_total},esp:${s.specialty})`).join(" | ")}
Medições: total ${measurements.length}, aprovadas ${measurements.filter(m => m.status === "Aprovada").length}, pendentes ${measurements.filter(m => m.status === "Pendente").length}
Valor executado: R$ ${measurements.filter(m => m.status === "Aprovada").reduce((s, m) => s + (m.total_value || 0), 0).toLocaleString("pt-BR")}
Documentos: total ${documents.length}, vencidos ${documents.filter(d => d.status === "Vencido").length}`;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages.map(m => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`).join("\n");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o Assistente IA da obra "${project.name}" no Consuobra. Responda em português, de forma direta e prática, usando os dados abaixo.

DADOS DA OBRA:
${context}

HISTÓRICO DA CONVERSA:
${history}

Responda à última pergunta do usuário de forma clara, objetiva e acionável. Use os dados fornecidos.`
    });

    setMessages(prev => [...prev, { role: "assistant", content: res }]);
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col" style={{ height: "60vh" }}>
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        <p className="font-semibold text-sm">Assistente IA da Obra</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <Bot className="h-10 w-10 text-primary/30" />
            <p className="text-sm text-muted-foreground max-w-xs">Pergunte qualquer coisa sobre a obra, empreiteiros, riscos ou pagamentos</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1"><Bot className="h-3 w-3 text-primary" /></div>}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m.role === "user" ? m.content : <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{m.content}</ReactMarkdown>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Bot className="h-3 w-3 text-primary" /></div>
            <div className="bg-muted rounded-2xl px-4 py-3"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Pergunte sobre a obra..." className="flex-1" disabled={loading} />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </div>
  );
}

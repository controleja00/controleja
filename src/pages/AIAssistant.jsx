import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Loader2, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import PageHeader from "../components/PageHeader";

const suggestions = [
  "A obra está no prazo? O que pode atrasar?",
  "Quais empreiteiros precisam de atenção agora?",
  "O caixa vai ficar negativo? Em quantos dias?",
  "Quais documentos podem gerar problema trabalhista?",
  "Me dê um resumo executivo da operação hoje.",
];

export default function AIAssistant() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.agents.createConversation({
      agent_name: "assistant",
      metadata: { name: "Nova conversa" }
    }).then(conv => setConversation(conv));
  }, []);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      if (data.messages?.at(-1)?.role === "assistant") setLoading(false);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || !conversation || loading) return;
    setInput("");
    setLoading(true);
    await base44.agents.addMessage(conversation, { role: "user", content: msg });
  };

  return (
    <div>
      <PageHeader title="Assistente IA" subtitle="Faça perguntas sobre suas obras, subempreiteiros, riscos e documentos" />
      <div className="flex flex-col h-[calc(100vh-130px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">Gerente IA — Consuobra</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">Falo como gerente de obras, não como robô. Sou específico com números, impactos e ações concretas. Pode perguntar.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                {m.role === "user" ? m.content : (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {m.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-border p-4 bg-background">
          <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Pergunte sobre obras, subempreiteiros, documentos..." className="flex-1" disabled={loading || !conversation} />
            <Button type="submit" disabled={loading || !input.trim() || !conversation} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
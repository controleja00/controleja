import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "../components/PageHeader";
import { MessageSquare, Mail, BookOpen, CheckCircle2, Zap } from "lucide-react";

const faqs = [
  { q: "Como cadastrar uma nova obra?", a: 'Acesse "Obras" no menu inferior e toque em "Nova Obra". Preencha nome, endereço e cliente para começar.' },
  { q: "Como registrar um gasto?", a: 'Acesse "Gastos" no menu inferior, clique em "Novo Lançamento" e preencha os dados da despesa.' },
  { q: "Como enviar um documento?", a: 'Acesse "Documentos", clique em "Enviar Documento", selecione a obra e o tipo, depois anexe o arquivo.' },
  { q: "Como acompanhar o progresso de uma obra?", a: 'Na página "Obras", clique em "Ver obra" para acessar a Central da Obra com etapas, gastos, documentos e fotos.' },
  { q: "Como gerar um relatório?", a: 'Acesse "Relatórios" no menu, selecione a obra desejada e clique em "Gerar Relatório".' },
  { q: "Meus dados são seguros?", a: 'Sim. Seus dados são protegidos com criptografia TLS/SSL e estamos em conformidade com a LGPD. Seus dados são usados apenas para organizar suas obras.' },
];

export default function Support() {
  const [form, setForm] = useState({ subject: "", category: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const send = async () => {
    setError("");
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "suporte@consuobra.com.br",
        subject: `[Suporte Consuobra] ${form.category}: ${form.subject}`,
        body: `Categoria: ${form.category}\nAssunto: ${form.subject}\n\nMensagem:\n${form.message}`,
      });
      setSent(true);
    } catch {
      setError("Erro ao enviar o chamado. Tente novamente ou envie um e-mail diretamente para suporte@consuobra.com.br.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader title="Suporte" subtitle="Estamos aqui para ajudar com o controle das suas obras." />
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
        {/* Canais */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 flex gap-4 items-start" style={{ border: "1.5px solid #efefef" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#fef1e1" }}>
              <MessageSquare className="h-5 w-5" style={{ color: "#004038" }} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">WhatsApp</p>
              <p className="text-xs text-gray-500 mt-0.5">Em breve disponível</p>
              <p className="text-xs text-gray-400 mt-1">Estamos configurando o canal de atendimento via WhatsApp.</p>
            </div>
          </div>
          <a href="mailto:suporte@consuobra.com.br" className="bg-white rounded-2xl p-5 flex gap-4 items-start transition-all hover:border-[#004038]" style={{ border: "1.5px solid #efefef" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#e5d3f7" }}>
              <Mail className="h-5 w-5" style={{ color: "#004038" }} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900">E-mail</p>
              <p className="text-xs text-gray-500 mt-0.5">Resposta em até 24h</p>
              <p className="text-xs mt-1 font-medium" style={{ color: "#004038" }}>suporte@consuobra.com.br</p>
            </div>
          </a>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Formulário */}
          <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid #efefef" }}>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" style={{ color: "#004038" }} />Abrir chamado
            </h2>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <p className="font-bold text-gray-900">Chamado enviado!</p>
                <p className="text-sm text-gray-500">Nossa equipe responderá em até 24 horas pelo e-mail cadastrado.</p>
                <Button variant="outline" size="sm" onClick={() => { setSent(false); setForm({ subject: "", category: "", message: "" }); }}>
                  Novo chamado
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="text-sm rounded-xl px-4 py-3 bg-red-50 border border-red-100 text-red-600">
                    {error}
                  </div>
                )}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Categoria</Label>
                  <Select value={form.category} onValueChange={v => set("category", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {["Dúvida sobre obras", "Problema técnico", "Financeiro / Cobrança", "Conta e acesso", "Sugestão de melhoria", "Outro"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Assunto</Label>
                  <Input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Descreva brevemente" className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Mensagem</Label>
                  <Textarea value={form.message} onChange={e => set("message", e.target.value)} placeholder="Descreva em detalhes o que aconteceu..." rows={4} className="mt-1.5" />
                </div>
                <Button
                  onClick={send}
                  disabled={sending || !form.subject || !form.category || !form.message}
                  className="w-full"
                >
                  {sending ? "Enviando..." : "Enviar chamado"}
                </Button>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid #efefef" }}>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" style={{ color: "#004038" }} />Perguntas frequentes
            </h2>
            <div className="space-y-2">
              {faqs.map(faq => (
                <details key={faq.q} className="group border border-gray-100 rounded-xl">
                  <summary className="px-4 py-3 text-sm font-semibold cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors text-gray-800">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-xs">▾</span>
                  </summary>
                  <p className="px-4 pb-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Consuobra · suporte@consuobra.com.br · Seus dados são protegidos pela LGPD
        </p>
      </div>
    </div>
  );
}

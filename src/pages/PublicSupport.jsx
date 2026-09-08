import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, Mail, MessageSquare, CheckCircle2, BookOpen, Zap } from "lucide-react";

const faqs = [
  { q: "Como criar uma conta no ControleJá?", a: 'Clique em "Criar conta grátis" na página inicial, preencha seu e-mail e senha e confirme seu e-mail. É rápido e gratuito.' },
  { q: "O ControleJá é gratuito?", a: "Sim! O plano Inicial é gratuito para sempre e permite controlar 1 obra com gastos, documentos e alertas básicos." },
  { q: "Funciona no celular?", a: "Sim, o ControleJá é totalmente responsivo e funciona bem em qualquer smartphone, sem precisar instalar nada." },
  { q: "Meus dados são seguros?", a: "Sim. Usamos criptografia TLS/SSL e estamos em conformidade com a LGPD. Seus dados são usados apenas para organizar suas obras." },
  { q: "Como cadastrar uma obra?", a: 'Após criar sua conta, acesse "Obras" e clique em "Nova Obra". Preencha nome, endereço e cliente para começar.' },
  { q: "Posso usar com minha equipe?", a: "Sim, no plano Empresa você pode adicionar múltiplos usuários com permissões diferentes. Fale com nossa equipe para saber mais." },
];

const NavLogo = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1B2F55 0%, #243F73 100%)" }}>
      <Building2 className="h-4 w-4 text-[#D7D9DE]" />
    </div>
    <div className="leading-none">
      <span className="font-black text-lg tracking-tight" style={{ color: "#1B2F55" }}>ControleJá</span>
      <p className="text-[9px] font-semibold uppercase tracking-widest hidden sm:block" style={{ color: "#A8ABB3" }}>Grupo Busk</p>
    </div>
  </Link>
);

export default function PublicSupport() {
  useEffect(() => { document.title = "Suporte | ControleJá"; }, []);
  const [form, setForm] = useState({ name: "", email: "", category: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const send = async () => {
    if (!form.email || !form.message) { setError("Preencha e-mail e mensagem."); return; }
    setError(""); setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "suporte@controleja.com.br",
        subject: `[Suporte ControleJá] ${form.category || "Geral"}: ${form.name || form.email}`,
        body: `Nome: ${form.name}\nE-mail: ${form.email}\nCategoria: ${form.category || "Não informada"}\n\nMensagem:\n${form.message}`,
      });
      setSent(true);
    } catch { setError("Erro ao enviar. Tente novamente ou envie um e-mail diretamente."); }
    finally { setSending(false); }
  };

  const inputStyle = { border: "1.5px solid #D7D9DE", background: "#F4F6FA", color: "#101828" };
  const inputClass = "w-full h-10 rounded-xl px-3 text-sm outline-none transition-all mt-1.5";

  return (
    <div className="min-h-screen font-sans" style={{ background: "#F4F6FA" }}>
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(244,246,250,0.97)", borderColor: "#D7D9DE", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLogo />
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium px-3 py-1.5" style={{ color: "#667085" }}>Entrar</Link>
            <Link to="/register" className="text-sm font-bold px-4 py-2 rounded-xl text-white shadow-md" style={{ background: "#1B2F55" }}>Criar conta</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-3" style={{ color: "#101828" }}>Suporte</h1>
          <p className="text-lg" style={{ color: "#667085" }}>Precisa de ajuda com o ControleJá? Estamos aqui.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <a href="mailto:suporte@controleja.com.br" className="flex gap-4 items-start rounded-2xl p-5 transition-all" style={{ background: "rgba(27,47,85,0.06)", border: "1.5px solid rgba(27,47,85,0.15)" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#1B2F55" }}>
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold" style={{ color: "#101828" }}>E-mail</p>
              <p className="text-sm" style={{ color: "#667085" }}>Resposta em até 24 horas úteis</p>
              <p className="text-sm font-semibold mt-1" style={{ color: "#1B2F55" }}>suporte@controleja.com.br</p>
            </div>
          </a>
          <div className="flex gap-4 items-start rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1.5px solid #D7D9DE" }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#D7D9DE" }}>
              <MessageSquare className="h-5 w-5" style={{ color: "#A8ABB3" }} />
            </div>
            <div>
              <p className="font-bold" style={{ color: "#101828" }}>WhatsApp</p>
              <p className="text-sm" style={{ color: "#667085" }}>Em breve disponível</p>
              <p className="text-xs mt-1" style={{ color: "#A8ABB3" }}>Estamos configurando o atendimento via WhatsApp.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl p-6 shadow-sm bg-white" style={{ border: "1.5px solid #D7D9DE" }}>
            <h2 className="font-bold mb-5 flex items-center gap-2" style={{ color: "#101828" }}>
              <BookOpen className="h-4 w-4" style={{ color: "#1B2F55" }} />Enviar mensagem
            </h2>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <p className="font-bold" style={{ color: "#101828" }}>Mensagem enviada!</p>
                <p className="text-sm" style={{ color: "#667085" }}>Nossa equipe responderá em até 24 horas no e-mail informado.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", category: "", message: "" }); }} className="mt-1 text-sm font-semibold px-4 py-2 rounded-xl border" style={{ borderColor: "#D7D9DE", color: "#1B2F55" }}>
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {error && <div className="text-sm rounded-xl px-4 py-3" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>{error}</div>}
                <div>
                  <label className="text-sm font-semibold" style={{ color: "#101828" }}>Seu nome</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="João Silva" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-sm font-semibold" style={{ color: "#101828" }}>Seu e-mail *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="seu@email.com" className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5" style={{ color: "#101828" }}>Categoria</label>
                  <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full h-10 rounded-xl px-3 text-sm outline-none" style={inputStyle}>
                    <option value="">Selecione</option>
                    {["Dúvida geral", "Problema técnico", "Conta e acesso", "Planos e preços", "Sugestão", "Outro"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold" style={{ color: "#101828" }}>Mensagem *</label>
                  <textarea value={form.message} onChange={e => set("message", e.target.value)} placeholder="Descreva sua dúvida ou problema..." rows={4} className="w-full rounded-xl px-3 py-2 text-sm outline-none mt-1.5 resize-none" style={inputStyle} />
                </div>
                <button onClick={send} disabled={sending || !form.email || !form.message} className="w-full h-11 rounded-xl font-bold text-white disabled:opacity-60" style={{ background: "#1B2F55" }}>
                  {sending ? "Enviando..." : "Enviar mensagem"}
                </button>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-bold mb-5 flex items-center gap-2" style={{ color: "#101828" }}>
              <Zap className="h-4 w-4" style={{ color: "#1B2F55" }} />Perguntas frequentes
            </h2>
            <div className="space-y-2">
              {faqs.map(faq => (
                <details key={faq.q} className="group rounded-xl" style={{ border: "1.5px solid #D7D9DE" }}>
                  <summary className="px-4 py-3 text-sm font-semibold cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors" style={{ color: "#101828" }}>
                    {faq.q}<span className="group-open:rotate-180 transition-transform text-xs ml-2 shrink-0" style={{ color: "#A8ABB3" }}>▾</span>
                  </summary>
                  <p className="px-4 pb-3 text-sm leading-relaxed" style={{ color: "#667085" }}>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-8 mt-4" style={{ background: "#13233F" }}>
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "#7F95BA" }}>
          <div>
            <span className="font-black text-white">ControleJá</span>
            <p className="text-[11px] mt-0.5" style={{ color: "#7F95BA" }}>Uma solução do Grupo Busk</p>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Termos</Link>
          </div>
          <p className="text-xs" style={{ color: "#A8ABB3" }}>© 2026 ControleJá · Grupo Busk · LGPD · Brasil</p>
        </div>
      </footer>
    </div>
  );
}
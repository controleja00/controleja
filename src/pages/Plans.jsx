import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, CheckCircle2, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Inicial",
    price: "Grátis",
    period: "para sempre",
    desc: "Perfeito para começar a organizar suas obras.",
    features: ["1 obra ativa", "Controle de gastos", "Documentos da obra", "Alertas básicos", "Acesso pelo celular"],
    cta: "Criar conta grátis",
    ctaTo: "/register",
    highlight: false,
  },
  {
    name: "Profissional",
    price: "R$ 97",
    period: "/mês",
    desc: "Para construtores com múltiplas obras e equipes.",
    features: ["Obras ilimitadas", "Relatórios em PDF", "Etapas e medições", "Gestão de equipes", "Documentos avançados", "Alertas de vencimento", "Suporte por e-mail"],
    cta: "Começar grátis",
    ctaTo: "/register",
    highlight: true,
    tag: "Mais popular",
  },
  {
    name: "Empresa",
    price: "Sob consulta",
    period: "",
    desc: "Para construtoras com múltiplos usuários e obras.",
    features: ["Tudo do Profissional", "Múltiplos usuários", "Permissões por usuário", "Relatórios avançados", "Integração via API", "Suporte dedicado", "SLA garantido"],
    cta: "Falar com a equipe",
    ctaTo: "/support",
    highlight: false,
  },
];

const NavLogo = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #123C34 0%, #1F6F61 100%)" }}>
      <Building2 className="h-4 w-4 text-[#DCE6E1]" />
    </div>
    <div className="leading-none">
      <span className="font-black text-lg tracking-tight" style={{ color: "#123C34" }}>Consuobra</span>
      <p className="text-[9px] font-semibold uppercase tracking-widest hidden sm:block" style={{ color: "#81928B" }}>Obra sob controle</p>
    </div>
  </Link>
);

export default function Plans() {
  useEffect(() => { document.title = "Planos | Consuobra"; }, []);
  return (
    <div className="min-h-screen font-sans" style={{ background: "#F3F6F2" }}>
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(244,246,250,0.97)", borderColor: "#DCE6E1", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLogo />
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium px-3 py-1.5" style={{ color: "#52615B" }}>Entrar</Link>
            <Link to="/register" className="text-sm font-bold px-4 py-2 rounded-xl text-white shadow-md" style={{ background: "#123C34" }}>Criar conta grátis</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl font-black mb-3" style={{ color: "#111917" }}>Planos simples e transparentes</h1>
        <p className="text-lg" style={{ color: "#52615B" }}>Comece grátis, sem cartão. Faça upgrade quando precisar de mais.</p>
        <div className="flex flex-wrap gap-4 justify-center mt-5 text-sm" style={{ color: "#52615B" }}>
          {["Sem cartão de crédito", "Sem período de teste obrigatório", "Cancele quando quiser"].map(t => (
            <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{t}</span>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className="relative rounded-2xl p-7 flex flex-col bg-white" style={{ border: plan.highlight ? "2px solid #123C34" : "1.5px solid #DCE6E1", boxShadow: plan.highlight ? "0 8px 32px rgba(27,47,85,0.15)" : "none" }}>
              {plan.tag && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full whitespace-nowrap text-white" style={{ background: "#123C34" }}>{plan.tag}</span>
              )}
              <div className="mb-5">
                <h3 className="font-black text-xl" style={{ color: "#111917" }}>{plan.name}</h3>
                <p className="text-sm mt-1" style={{ color: "#52615B" }}>{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black" style={{ color: "#123C34" }}>{plan.price}</span>
                {plan.period && <span className="text-sm ml-2" style={{ color: "#81928B" }}>{plan.period}</span>}
              </div>
              <ul className="space-y-3 flex-1 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#111917" }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />{f}
                  </li>
                ))}
              </ul>
              <Link to={plan.ctaTo} className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm transition-colors" style={plan.highlight ? { background: "#123C34", color: "#FFFFFF" } : { border: "2px solid #DCE6E1", color: "#123C34", background: "#FFFFFF" }}>
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-16 space-y-3">
          <h2 className="text-2xl font-black text-center mb-8" style={{ color: "#111917" }}>Perguntas frequentes</h2>
          {[
            { q: "Preciso de cartão de crédito para criar conta?", a: "Não. O plano Inicial é gratuito e não exige cartão de crédito para começar." },
            { q: "Posso trocar de plano depois?", a: "Sim. Você pode fazer upgrade ou downgrade a qualquer momento pelas configurações da conta." },
            { q: "Meus dados ficam seguros?", a: "Sim. Usamos criptografia TLS/SSL, backups automáticos e estamos em conformidade com a LGPD." },
          ].map(faq => (
            <details key={faq.q} className="group rounded-xl" style={{ border: "1.5px solid #DCE6E1" }}>
              <summary className="px-5 py-4 text-sm font-semibold cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors" style={{ color: "#111917" }}>
                {faq.q}<span className="group-open:rotate-180 transition-transform text-xs ml-3 shrink-0" style={{ color: "#81928B" }}>▾</span>
              </summary>
              <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "#52615B" }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer style={{ background: "#101A18" }} className="py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: "#668078" }}>
          <div>
            <span className="font-black text-white">Consuobra</span>
            <p className="text-[11px] mt-0.5" style={{ color: "#668078" }}>Uma solução do Obra sob controle</p>
          </div>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Termos</Link>
            <Link to="/support" className="hover:text-white transition-colors">Suporte</Link>
          </div>
          <p className="text-xs" style={{ color: "#81928B" }}>© 2026 Consuobra · Obra sob controle · LGPD</p>
        </div>
      </footer>
    </div>
  );
}
import { useEffect } from "react";
import { Building2, CheckCircle2, DollarSign, FileText, Bell, ArrowRight, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Building2, color: "bg-[#243F73] text-[#A7B6D2]", title: "Controle de Obras", desc: "Acompanhe o andamento de cada obra, etapas, responsáveis e prazos em tempo real." },
  { icon: DollarSign, color: "bg-emerald-700 text-emerald-200", title: "Controle de Gastos", desc: "Registre despesas, compare com o orçamento e saiba exatamente onde está gastando." },
  { icon: FileText, color: "bg-[#1B2F55] text-[#A7B6D2]", title: "Documentos Organizados", desc: "Contratos, alvarás, notas fiscais e certidões em um só lugar, com alertas de vencimento." },
  { icon: Bell, color: "bg-red-800 text-red-200", title: "Alertas Inteligentes", desc: "Receba avisos de atrasos, documentos vencendo e obras sem atualização." },
  { icon: BarChart3, color: "bg-[#243F73] text-[#A7B6D2]", title: "Relatórios Simples", desc: "Gere relatórios em PDF com progresso, gastos e documentos em um clique." },
  { icon: Shield, color: "bg-[#13233F] text-[#7F95BA]", title: "Segurança LGPD", desc: "Seus dados protegidos com criptografia TLS/SSL e conformidade total com a LGPD." },
];

const steps = [
  { num: "1", label: "Crie sua conta", desc: "Grátis, sem cartão" },
  { num: "2", label: "Cadastre sua obra", desc: "Nome, endereço, prazo" },
  { num: "3", label: "Registre etapas e gastos", desc: "Acompanhe tudo" },
  { num: "4", label: "Gere relatórios", desc: "PDF com um clique" },
];

const NavLogo = () => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #1B2F55 0%, #243F73 100%)", border: "1.5px solid #D7D9DE33" }}>
      <Building2 className="h-4.5 w-4.5 text-[#D7D9DE]" />
    </div>
    <div className="leading-none">
      <span className="font-black text-lg text-[#1B2F55] tracking-tight">ControleJá</span>
      <p className="text-[9px] text-[#A8ABB3] font-semibold uppercase tracking-widest hidden sm:block">Grupo Busk</p>
    </div>
  </Link>
);

const Footer = () => (
  <footer style={{ background: "#13233F" }} className="text-[#7F95BA] py-10">
    <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-5 text-sm">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-6 w-6 rounded-lg" style={{ background: "#1B2F55", border: "1px solid #D7D9DE33" }}>
            <Building2 className="h-3 w-3 text-[#D7D9DE] m-auto mt-1.5" />
          </div>
          <span className="font-black text-white">ControleJá</span>
        </div>
        <p className="text-[11px] text-[#7F95BA]">Uma solução do Grupo Busk</p>
      </div>
      <div className="flex gap-6">
        <Link to="/plans" className="hover:text-white transition-colors">Planos</Link>
        <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
        <Link to="/terms" className="hover:text-white transition-colors">Termos</Link>
        <Link to="/support" className="hover:text-white transition-colors">Suporte</Link>
      </div>
      <p className="text-xs text-[#A8ABB3]">© 2026 ControleJá · Grupo Busk · LGPD · Brasil</p>
    </div>
  </footer>
);

export default function LandingPage() {
  useEffect(() => { document.title = "ControleJá | Controle de Obras, Gastos e Documentos"; }, []);
  return (
    <div className="min-h-screen font-sans" style={{ background: "#F4F6FA" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(244,246,250,0.97)", borderColor: "#D7D9DE", backdropFilter: "blur(12px)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <NavLogo />
          <div className="flex items-center gap-2">
            <Link to="/plans" className="hidden sm:block text-sm font-medium px-3 py-1.5 transition-colors" style={{ color: "#667085" }}>Planos</Link>
            <Link to="/login" className="text-sm font-medium px-3 py-1.5 transition-colors" style={{ color: "#667085" }}>Entrar</Link>
            <Link to="/register" className="text-sm font-bold px-4 py-2 rounded-xl transition-colors text-white flex items-center gap-1.5 shadow-md" style={{ background: "#1B2F55" }}>
              <span className="hidden sm:inline">Criar conta grátis</span>
              <span className="sm:hidden">Criar conta</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — fundo azul-marinho profundo */}
      <section style={{ background: "linear-gradient(160deg, #13233F 0%, #1B2F55 50%, #243F73 100%)" }} className="relative overflow-hidden">
        {/* Decorações sutis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7F95BA 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #A7B6D2 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-6 border" style={{ background: "rgba(167,182,210,0.12)", borderColor: "rgba(167,182,210,0.3)", color: "#A7B6D2" }}>
            🏗️ Para construtores, engenheiros e gestores de obra
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5 max-w-3xl mx-auto" style={{ color: "#FFFFFF" }}>
            Controle suas obras, custos, documentos e equipes em um só lugar.
          </h1>
          <p className="text-lg mb-9 max-w-xl mx-auto leading-relaxed" style={{ color: "#A7B6D2" }}>
            O ControleJá ajuda construtores a acompanhar o andamento das obras, controlar gastos, organizar documentos, registrar fotos e evitar atrasos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 font-bold text-base px-8 py-4 rounded-xl transition-colors shadow-lg text-[#1B2F55]" style={{ background: "#D7D9DE" }}>
              Criar conta grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 font-semibold text-base px-8 py-4 rounded-xl transition-all border text-white" style={{ borderColor: "rgba(167,182,210,0.4)", background: "rgba(167,182,210,0.08)" }}>
              Entrar
            </Link>
          </div>
          <div className="flex flex-wrap gap-5 justify-center text-sm" style={{ color: "#7F95BA" }}>
            {["Sem cartão de crédito", "Grátis para começar", "100% em português", "Funciona no celular"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard mockup */}
      <section className="py-12 px-4" style={{ background: "#F4F6FA" }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: "#D7D9DE" }}>
            <div className="px-5 py-3 flex items-center gap-3" style={{ background: "#1B2F55" }}>
              <Building2 className="h-4 w-4" style={{ color: "#A7B6D2" }} />
              <span className="font-bold text-sm" style={{ color: "#D7D9DE" }}>ControleJá — Dashboard</span>
              <div className="ml-auto flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="p-5 bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Obras ativas", val: "3", color: "#1B2F55" },
                  { label: "Gastos do mês", val: "R$ 48k", color: "#16A34A" },
                  { label: "Documentos", val: "12", color: "#243F73" },
                  { label: "Alertas", val: "2", color: "#DC2626" },
                ].map(k => (
                  <div key={k.label} className="border rounded-xl p-3" style={{ borderColor: "#D7D9DE", background: "#F4F6FA" }}>
                    <p className="text-xs mb-1" style={{ color: "#A8ABB3" }}>{k.label}</p>
                    <p className="text-xl font-black" style={{ color: k.color }}>{k.val}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { name: "Residencial Primavera", status: "Em andamento", pct: 65 },
                  { name: "Galpão Industrial Norte", status: "Atrasada", pct: 40 },
                  { name: "Reforma Comercial Centro", status: "Concluída", pct: 100 },
                ].map(p => (
                  <div key={p.name} className="flex items-center gap-3 border rounded-xl px-4 py-3 bg-white" style={{ borderColor: "#D7D9DE" }}>
                    <Building2 className="h-4 w-4 shrink-0" style={{ color: "#A8ABB3" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#101828" }}>{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#D7D9DE" }}>
                          <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.status === "Concluída" ? "#16A34A" : p.status === "Atrasada" ? "#DC2626" : "#1B2F55" }} />
                        </div>
                        <span className="text-xs shrink-0" style={{ color: "#A8ABB3" }}>{p.pct}%</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{
                      background: p.status === "Em andamento" ? "rgba(27,47,85,0.1)" : p.status === "Atrasada" ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)",
                      color: p.status === "Em andamento" ? "#1B2F55" : p.status === "Atrasada" ? "#DC2626" : "#16A34A"
                    }}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-sm mt-4" style={{ color: "#A8ABB3" }}>Dashboard real do ControleJá — visualize tudo em um só lugar</p>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-4" style={{ background: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3" style={{ color: "#101828" }}>Por que usar o ControleJá?</h2>
            <p className="max-w-lg mx-auto" style={{ color: "#667085" }}>Tudo que você precisa para controlar suas obras no dia a dia, sem complicação.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map(b => (
              <div key={b.title} className="border rounded-2xl p-6 hover:shadow-md transition-all" style={{ borderColor: "#D7D9DE", background: "#FFFFFF" }}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${b.color}`}>
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: "#101828" }}>{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#667085" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4" style={{ background: "#1B2F55" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3">Como funciona?</h2>
          <p className="mb-10" style={{ color: "#A7B6D2" }}>Em 4 passos simples você começa a controlar suas obras.</p>
          <div className="grid sm:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[60%] w-full h-0.5" style={{ background: "rgba(167,182,210,0.25)" }} />
                )}
                <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 font-black text-lg shadow-md" style={{ background: "#D7D9DE", color: "#1B2F55" }}>{s.num}</div>
                <p className="font-bold text-sm text-white">{s.label}</p>
                <p className="text-xs mt-1" style={{ color: "#7F95BA" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="py-20 px-4" style={{ background: "#F4F6FA" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3" style={{ color: "#101828" }}>Para quem é o ControleJá?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { emoji: "👷", title: "Construtores autônomos", desc: "Controle suas obras sem planilha. Tudo no celular, simples e rápido." },
              { emoji: "🏗️", title: "Pequenas construtoras", desc: "Gerencie várias obras, equipes e fornecedores em um único painel." },
              { emoji: "👩‍💼", title: "Engenheiros e Arquitetos", desc: "Organize projetos, documentos, etapas e entregas com precisão." },
              { emoji: "🏢", title: "Gestores de obra", desc: "Relatórios, alertas e decisões baseadas em dados reais da obra." },
            ].map(u => (
              <div key={u.title} className="flex gap-4 border rounded-2xl p-6 hover:shadow-md transition-all bg-white" style={{ borderColor: "#D7D9DE" }}>
                <div className="text-3xl shrink-0">{u.emoji}</div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "#101828" }}>{u.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#667085" }}>{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section className="py-10 px-4 border-y" style={{ background: "#FFFFFF", borderColor: "#D7D9DE" }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 mx-auto sm:mx-0" style={{ background: "#1B2F55" }}>
            <Shield className="h-6 w-6 text-[#D7D9DE]" />
          </div>
          <div>
            <p className="font-bold mb-1" style={{ color: "#101828" }}>Seus dados são seus. Sempre.</p>
            <p className="text-sm" style={{ color: "#667085" }}>
              Seus dados são usados apenas para organizar e controlar suas obras. Conformidade total com a LGPD.{" "}
              <Link to="/privacy" className="hover:underline font-medium" style={{ color: "#1B2F55" }}>Política de Privacidade</Link>
              {" "}·{" "}
              <Link to="/terms" className="hover:underline font-medium" style={{ color: "#1B2F55" }}>Termos de Uso</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 text-center" style={{ background: "#F4F6FA" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-3" style={{ color: "#101828" }}>Comece controlando sua primeira obra</h2>
          <p className="text-lg mb-8" style={{ color: "#667085" }}>Grátis, sem cartão de crédito e sem complicação.</p>
          <Link to="/register" className="inline-flex items-center gap-2 font-bold text-lg px-10 py-4 rounded-xl transition-colors shadow-lg text-white" style={{ background: "#1B2F55" }}>
            Criar conta grátis <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-xs mt-4" style={{ color: "#A8ABB3" }}>Sem cartão de crédito · Cancele quando quiser · Suporte em português</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
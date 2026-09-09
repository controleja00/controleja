import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FileText,
  HardHat,
  Shield,
} from "lucide-react";
import BrandLogo, { BrandMark } from "@/components/BrandLogo";

const features = [
  { icon: Building2, bg: "#e7ebf4", title: "Obras em andamento", desc: "Veja progresso, prazo, responsáveis e etapas críticas em uma tela simples." },
  { icon: DollarSign, bg: "#eff2f8", title: "Custos sob controle", desc: "Acompanhe gastos, receitas contratadas e saldo disponível por obra." },
  { icon: FileText, bg: "#d6ddea", title: "Documentos organizados", desc: "Contratos, notas e arquivos importantes sem conversa perdida no WhatsApp." },
  { icon: Bell, bg: "#8096bc", title: "Alertas práticos", desc: "Receba avisos de atraso, documento vencendo e obra sem atualização." },
  { icon: BarChart3, bg: "#9aabcd", title: "Relatórios claros", desc: "Gere acompanhamento para você e para o cliente com menos retrabalho." },
  { icon: Shield, bg: "#ffffff", title: "Operação segura", desc: "Base para LGPD, acesso por usuário e evolução para estrutura própria." },
];

const steps = [
  "Cadastre a obra",
  "Registre etapas, fotos e gastos",
  "Acompanhe alertas e progresso",
  "Compartilhe relatórios com o cliente",
];

function ProductPreview() {
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#e1e5ed" }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandMark className="h-8 w-8 rounded-xl" />
          <div>
            <p className="text-sm font-bold" style={{ color: "#172441" }}>Residencial Primavera</p>
            <p className="text-xs" style={{ color: "#778096" }}>Central da obra</p>
          </div>
        </div>
        <span className="rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: "#1f3258" }}>68%</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Receita", "R$ 420k", "#1f3258"],
          ["Gastos", "R$ 188k", "#1d0953"],
          ["Fotos hoje", "14", "#424c62"],
          ["Alertas", "2", "#1f3258"],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "#f6f8fc" }}>
            <p className="text-xs" style={{ color: "#778096" }}>{label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {[
          ["Fundação concluída", 100],
          ["Alvenaria em execução", 72],
          ["Instalações pendentes", 24],
        ].map(([name, pct]) => (
          <div key={name} className="rounded-2xl border p-3" style={{ borderColor: "#e1e5ed" }}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: "#172441" }}>{name}</p>
              <p className="text-xs font-bold" style={{ color: "#1f3258" }}>{pct}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: "#e1e5ed" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#1f3258" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  useEffect(() => { document.title = "Consuobra | Gestão Simples e Inteligente de Obras"; }, []);

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f6f8fc", color: "#172441" }}>
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(251,250,248,0.94)", borderColor: "#e1e5ed", backdropFilter: "blur(14px)" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <BrandLogo size="md" />
          <div className="flex items-center gap-2">
            <Link to="/plans" className="hidden px-3 py-2 text-sm font-bold sm:block" style={{ color: "#1f3258" }}>Planos</Link>
            <Link to="/login" className="px-3 py-2 text-sm font-bold" style={{ color: "#1f3258" }}>Entrar</Link>
            <Link to="/register" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: "#1f3258" }}>Criar conta</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold" style={{ background: "#e7ebf4", color: "#1d0953" }}>
            <HardHat className="h-4 w-4" /> Plataforma para construtores que precisam de clareza
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] sm:text-6xl" style={{ color: "#172441" }}>
            Controle a obra inteira sem perder o dia organizando informação.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-[1.56]" style={{ color: "#424c62" }}>
            A Consuobra reúne progresso, gastos, documentos, fotos e relatórios em uma rotina simples para quem vive obra de verdade.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-bold text-white" style={{ background: "#1f3258" }}>
              Criar conta grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center rounded-lg border px-6 py-4 text-base font-bold" style={{ borderColor: "#1f3258", color: "#1f3258" }}>
              Entrar na plataforma
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-5 text-sm" style={{ color: "#778096" }}>
            {["Sem cartão para começar", "Funciona no celular", "Relatórios para clientes", "Feito para obra"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: "#1f3258" }} /> {item}
              </span>
            ))}
          </div>
        </div>
        <ProductPreview />
      </section>

      <section className="border-y" style={{ borderColor: "#e1e5ed", background: "#ffffff" }}>
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-4">
          {[
            ["menos planilhas", "Tudo centralizado"],
            ["mais clareza", "Progresso visível"],
            ["menos atraso", "Alertas no painel"],
            ["mais confiança", "Cliente informado"],
          ].map(([top, bottom]) => (
            <div key={top}>
              <p className="text-3xl font-bold" style={{ color: "#1d0953" }}>{top}</p>
              <p className="mt-1 text-sm" style={{ color: "#778096" }}>{bottom}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="mb-3 text-xs font-bold uppercase" style={{ color: "#778096" }}>O que muda na rotina</p>
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="max-w-2xl text-4xl font-bold leading-tight" style={{ color: "#172441" }}>Uma central leve para controlar o que normalmente fica espalhado.</h2>
          <p className="max-w-sm text-base leading-[1.56]" style={{ color: "#424c62" }}>A interface foi pensada para registrar rápido no campo e analisar com calma no escritório.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl p-8" style={{ background: feature.bg, border: feature.bg === "#ffffff" ? "1px solid #e1e5ed" : "none" }}>
              <feature.icon className="mb-6 h-7 w-7" style={{ color: "#1f3258" }} />
              <h3 className="text-2xl font-bold leading-tight" style={{ color: "#172441" }}>{feature.title}</h3>
              <p className="mt-3 text-base leading-[1.56]" style={{ color: "#424c62" }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20" style={{ background: "#eff2f8" }}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase" style={{ color: "#778096" }}>Como começa</p>
          <h2 className="max-w-2xl text-4xl font-bold leading-tight" style={{ color: "#172441" }}>Quatro passos para colocar sua primeira obra no controle.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl bg-white p-6">
                <span className="mb-8 flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white" style={{ background: "#1f3258" }}>{index + 1}</span>
                <p className="text-xl font-bold leading-tight" style={{ color: "#172441" }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-6 rounded-2xl p-8 sm:grid-cols-[1fr_auto] sm:items-center" style={{ background: "#1f3258" }}>
          <div>
            <ClipboardCheck className="mb-5 h-8 w-8 text-white" />
            <h2 className="max-w-2xl text-4xl font-bold leading-tight text-white">Comece com uma obra. Escale quando sua operação pedir.</h2>
            <p className="mt-4 max-w-xl text-base leading-[1.56]" style={{ color: "#8096bc" }}>A Consuobra foi criada para ser simples no primeiro dia e útil quando sua empresa crescer.</p>
          </div>
          <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-4 text-base font-bold" style={{ color: "#1f3258" }}>
            Criar conta grátis
          </Link>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: "#e1e5ed", background: "#ffffff" }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo size="sm" />
          <div className="flex gap-5 text-sm font-bold" style={{ color: "#1f3258" }}>
            <Link to="/plans">Planos</Link>
            <Link to="/privacy">Privacidade</Link>
            <Link to="/terms">Termos</Link>
            <Link to="/support">Suporte</Link>
          </div>
          <p className="text-xs" style={{ color: "#778096" }}>© 2026 Consuobra · LGPD · Brasil</p>
        </div>
      </footer>
    </div>
  );
}

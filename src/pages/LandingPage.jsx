import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  DollarSign,
  FileText,
  HardHat,
  Image,
  MessageSquare,
  Smartphone,
  Users,
} from "lucide-react";
import BrandLogo, { BrandMark } from "@/components/BrandLogo";
import { CONTACT_EMAILS } from "@/lib/contact";
import { CONSUOBRA_PLANS, TRIAL_DAYS } from "@/lib/plans";

const colors = {
  ink: "#172441",
  brand: "#1f3258",
  navy: "#1d0953",
  muted: "#424c62",
  soft: "#778096",
  line: "#e1e5ed",
  wash: "#f6f8fc",
  blueWash: "#e7ebf4",
  mid: "#8096bc",
  pale: "#eff2f8",
  slate: "#d6ddea",
  white: "#ffffff",
};

const features = [
  { icon: Building2, bg: colors.blueWash, title: "Central da obra", desc: "Status, cliente, prazo, progresso, etapas e responsáveis em uma tela de consulta rápida." },
  { icon: DollarSign, bg: colors.pale, title: "Financeiro por obra", desc: "Receita contratada, gastos, saldo previsto e lançamentos sem depender de planilhas soltas." },
  { icon: Image, bg: colors.slate, title: "Fotos e histórico", desc: "Organize registros do campo para acompanhar evolução e prestar contas com mais confiança." },
  { icon: FileText, bg: colors.white, title: "Documentos no lugar certo", desc: "Contratos, notas, recibos e arquivos importantes separados por obra." },
  { icon: Bell, bg: colors.mid, title: "Alertas operacionais", desc: "Avisos de atraso, documento vencendo e obra sem atualização para agir antes do problema crescer." },
  { icon: BarChart3, bg: colors.blueWash, title: "Relatórios para cliente", desc: "Transforme acompanhamento diário em uma entrega simples, visual e profissional." },
];

const pains = [
  "Gastos ficam espalhados entre WhatsApp, caderno e planilha.",
  "O cliente cobra atualização e ninguém acha as fotos certas.",
  "A obra atrasa, mas o problema só aparece tarde demais.",
  "O dono sabe executar, mas perde tempo tentando organizar informação.",
];

const steps = [
  { title: "Cadastre a obra", desc: "Nome, cliente, endereço, receita contratada e prazo." },
  { title: "Atualize no dia a dia", desc: "Lance gastos, fotos, medições, documentos e observações." },
  { title: "Acompanhe o painel", desc: "Veja progresso, alertas, saldo e pendências importantes." },
  { title: "Compartilhe com o cliente", desc: "Use relatórios e portal para reduzir mensagens repetidas." },
];

const audiences = [
  { icon: HardHat, title: "Construtor pequeno", desc: "Controle uma ou mais obras sem montar uma operação complexa." },
  { icon: Users, title: "Empreiteiro", desc: "Mostre avanço, organize custos e tenha histórico do que foi feito." },
  { icon: ClipboardCheck, title: "Engenheiro", desc: "Centralize medições, documentos e relatórios para tomada de decisão." },
];

function ProductPreview() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: colors.line }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandMark className="h-8 w-8 rounded-xl" />
          <div>
            <p className="text-sm font-bold" style={{ color: colors.ink }}>Residencial Primavera</p>
            <p className="text-xs" style={{ color: colors.soft }}>Central da obra</p>
          </div>
        </div>
        <span className="rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: colors.brand }}>68%</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Receita", "R$ 420k", colors.brand],
          ["Gastos", "R$ 188k", colors.navy],
          ["Fotos hoje", "14", colors.muted],
          ["Alertas", "2", colors.brand],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: colors.wash }}>
            <p className="text-xs" style={{ color: colors.soft }}>{label}</p>
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
          <div key={name} className="rounded-2xl border p-3" style={{ borderColor: colors.line }}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: colors.ink }}>{name}</p>
              <p className="text-xs font-bold" style={{ color: colors.brand }}>{pct}%</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: colors.line }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors.brand }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: colors.blueWash }}>
        <p className="text-xs font-bold uppercase" style={{ color: colors.brand }}>Próxima ação</p>
        <p className="mt-1 text-sm" style={{ color: colors.muted }}>Revisar medição da alvenaria e anexar fotos do dia.</p>
      </div>
    </div>
  );
}

function PlanPreview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {CONSUOBRA_PLANS.map((plan) => (
        <div key={plan.id} className="rounded-2xl border bg-white p-5" style={{ borderColor: plan.highlight ? colors.brand : colors.line }}>
          {plan.tag && <p className="mb-2 text-xs font-black uppercase" style={{ color: colors.brand }}>{plan.tag}</p>}
          <h3 className="text-xl font-black" style={{ color: colors.ink }}>{plan.name}</h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: colors.muted }}>{plan.desc}</p>
          <div className="mt-5">
            <span className="text-3xl font-black" style={{ color: colors.brand }}>{plan.price}</span>
            <span className="text-sm" style={{ color: colors.soft }}>{plan.period}</span>
          </div>
          <ul className="mt-5 space-y-2">
            {plan.features.slice(0, 4).map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: colors.ink }}>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: colors.brand }} />{feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  useEffect(() => { document.title = "Consuobra | Controle de Obras para Construtores"; }, []);

  return (
    <div className="min-h-screen font-sans" style={{ background: colors.wash, color: colors.ink }}>
      <nav className="sticky top-0 z-50 border-b" style={{ background: "rgba(251,250,248,0.94)", borderColor: colors.line, backdropFilter: "blur(14px)" }}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <BrandLogo size="md" />
          <div className="flex items-center gap-2">
            <Link to="/plans" className="hidden px-3 py-2 text-sm font-bold sm:block" style={{ color: colors.brand }}>Planos</Link>
            <Link to="/support" className="hidden px-3 py-2 text-sm font-bold md:block" style={{ color: colors.brand }}>Suporte</Link>
            <Link to="/login" className="px-3 py-2 text-sm font-bold" style={{ color: colors.brand }}>Entrar</Link>
            <Link to="/register" className="rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ background: colors.brand }}>Criar conta</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold" style={{ background: colors.blueWash, color: colors.navy }}>
            <HardHat className="h-4 w-4" /> Para construtores, empreiteiros e engenheiros
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.08] sm:text-6xl" style={{ color: colors.ink }}>
            Sua obra sob controle sem depender de planilha, caderno e conversa perdida.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-[1.56]" style={{ color: colors.muted }}>
            A Consuobra organiza progresso, gastos, documentos, fotos e relatórios em um painel simples para quem precisa tocar obra todos os dias.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register?plan=free" className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-bold text-white" style={{ background: colors.brand }}>
              Começar grátis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/plans" className="inline-flex items-center justify-center rounded-lg border px-6 py-4 text-base font-bold" style={{ borderColor: colors.brand, color: colors.brand }}>
              Ver planos
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-5 text-sm" style={{ color: colors.soft }}>
            {["1 obra grátis", "Sem cartão para começar", "Funciona no celular", `${TRIAL_DAYS} dias de teste nos pagos`].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: colors.brand }} /> {item}
              </span>
            ))}
          </div>
        </div>
        <ProductPreview />
      </section>

      <section className="border-y" style={{ borderColor: colors.line, background: colors.white }}>
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 md:grid-cols-4">
          {[
            ["1 obra grátis", "Comece hoje"],
            ["R$ 19,90", "Plano Essencial"],
            ["R$ 69,90", "Plano Profissional"],
            ["24h úteis", "Suporte por e-mail"],
          ].map(([top, bottom]) => (
            <div key={top}>
              <p className="text-3xl font-black" style={{ color: colors.navy }}>{top}</p>
              <p className="mt-1 text-sm" style={{ color: colors.soft }}>{bottom}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs font-bold uppercase" style={{ color: colors.soft }}>O problema real</p>
            <h2 className="text-4xl font-black leading-tight" style={{ color: colors.ink }}>Obra pequena também precisa de controle profissional.</h2>
            <p className="mt-4 text-base leading-[1.56]" style={{ color: colors.muted }}>
              O Consuobra foi pensado para quem ainda não tem equipe administrativa grande, mas já não pode perder dinheiro por falta de organização.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pains.map((pain) => (
              <div key={pain} className="flex gap-3 rounded-2xl border bg-white p-5" style={{ borderColor: colors.line }}>
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: colors.brand }} />
                <p className="text-sm font-semibold leading-relaxed" style={{ color: colors.ink }}>{pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="mb-3 text-xs font-bold uppercase" style={{ color: colors.soft }}>O que a plataforma entrega</p>
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="max-w-2xl text-4xl font-black leading-tight" style={{ color: colors.ink }}>Uma central prática para controlar o que normalmente fica espalhado.</h2>
          <p className="max-w-sm text-base leading-[1.56]" style={{ color: colors.muted }}>Registre rápido no campo, revise no escritório e mostre evolução ao cliente com mais segurança.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl p-7" style={{ background: feature.bg, border: feature.bg === colors.white ? `1px solid ${colors.line}` : "none" }}>
              <feature.icon className="mb-6 h-7 w-7" style={{ color: colors.brand }} />
              <h3 className="text-2xl font-black leading-tight" style={{ color: colors.ink }}>{feature.title}</h3>
              <p className="mt-3 text-base leading-[1.56]" style={{ color: colors.muted }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16" style={{ background: colors.pale }}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs font-bold uppercase" style={{ color: colors.soft }}>Para quem é</p>
          <h2 className="max-w-2xl text-4xl font-black leading-tight" style={{ color: colors.ink }}>Feito para quem executa obra e precisa enxergar o básico sem complicação.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {audiences.map((audience) => (
              <div key={audience.title} className="rounded-2xl bg-white p-6">
                <audience.icon className="mb-7 h-7 w-7" style={{ color: colors.brand }} />
                <h3 className="text-xl font-black" style={{ color: colors.ink }}>{audience.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: colors.muted }}>{audience.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase" style={{ color: colors.soft }}>Como começa</p>
            <h2 className="text-4xl font-black leading-tight" style={{ color: colors.ink }}>Quatro passos para colocar sua primeira obra no controle.</h2>
            <Link to="/register?plan=free" className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white" style={{ background: colors.brand }}>
              Criar minha conta <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl bg-white p-6" style={{ border: `1px solid ${colors.line}` }}>
                <span className="mb-8 flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold text-white" style={{ background: colors.brand }}>{index + 1}</span>
                <p className="text-xl font-black leading-tight" style={{ color: colors.ink }}>{step.title}</p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: colors.muted }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16" style={{ background: colors.white }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase" style={{ color: colors.soft }}>Planos</p>
              <h2 className="max-w-2xl text-4xl font-black leading-tight" style={{ color: colors.ink }}>Comece pequeno e evolua quando sua operação pedir.</h2>
            </div>
            <Link to="/plans" className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-bold" style={{ borderColor: colors.brand, color: colors.brand }}>
              Comparar planos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <PlanPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 rounded-2xl p-8 sm:grid-cols-[1fr_auto] sm:items-center" style={{ background: colors.brand }}>
          <div>
            <Clock3 className="mb-5 h-8 w-8 text-white" />
            <h2 className="max-w-2xl text-4xl font-black leading-tight text-white">Publique sua primeira obra no controle hoje.</h2>
            <p className="mt-4 max-w-xl text-base leading-[1.56]" style={{ color: colors.mid }}>
              Crie a conta grátis, cadastre uma obra real e use a Consuobra como seu painel principal de acompanhamento.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/register?plan=free" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-4 text-base font-bold" style={{ color: colors.brand }}>
              Começar grátis
            </Link>
            <Link to="/support" className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-4 text-base font-bold text-white" style={{ borderColor: "rgba(255,255,255,0.35)" }}>
              <MessageSquare className="h-4 w-4" /> Tirar dúvida
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: colors.line, background: colors.white }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo size="sm" />
          <div className="flex flex-wrap gap-5 text-sm font-bold" style={{ color: colors.brand }}>
            <Link to="/plans">Planos</Link>
            <Link to="/privacy">Privacidade</Link>
            <Link to="/terms">Termos</Link>
            <Link to="/support">Suporte</Link>
          </div>
          <div className="text-xs sm:text-right" style={{ color: colors.soft }}>
            <p>© 2026 Consuobra · LGPD · Brasil</p>
            <p className="mt-1">{CONTACT_EMAILS.support}</p>
          </div>
        </div>
      </footer>
      <div className="fixed bottom-4 right-4 z-40 hidden sm:block">
        <Link to="/register?plan=free" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black text-white shadow-lg" style={{ background: colors.brand }}>
          <Smartphone className="h-4 w-4" /> Testar grátis
        </Link>
      </div>
    </div>
  );
}

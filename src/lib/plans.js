export const TRIAL_DAYS = 7;

export const CONSUOBRA_PLANS = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    desc: "Para testar o Consuobra em uma obra real, sem cartão de crédito.",
    features: [
      "1 obra ativa",
      "Controle de gastos básico",
      "Documentos da obra",
      "Alertas simples",
      "Acesso pelo celular",
    ],
    cta: "Criar conta grátis",
    ctaTo: "/register",
    highlight: false,
    limits: {
      activeProjects: 1,
      aiReportsPerMonth: 0,
      storageGb: 0.5,
      whatsappSupport: false,
    },
  },
  {
    id: "essential",
    name: "Essencial",
    price: "R$ 19,90",
    period: "/mês",
    desc: "Para autônomos, empreiteiros e engenheiros que querem sair da planilha.",
    features: [
      "Até 3 obras ativas",
      "Medições e progresso manual",
      "Controle financeiro por obra",
      "Documentos organizados",
      "Relatórios simples",
      "Portal do dono da obra",
      "Suporte por e-mail",
    ],
    cta: "Começar teste grátis",
    ctaTo: "/register",
    highlight: false,
    limits: {
      activeProjects: 3,
      aiReportsPerMonth: 5,
      storageGb: 2,
      whatsappSupport: false,
    },
  },
  {
    id: "professional",
    name: "Profissional",
    price: "R$ 69,90",
    period: "/mês",
    desc: "Para quem gerencia várias obras e precisa de relatórios, fotos e alertas inteligentes.",
    features: [
      "Até 20 obras ativas",
      "Fotos diárias da obra",
      "Relatórios automáticos com IA",
      "Central da obra completa",
      "Alertas inteligentes",
      "Documentos avançados",
      "Mais armazenamento",
      "Suporte prioritário por WhatsApp",
    ],
    cta: "Testar por 7 dias",
    ctaTo: "/register",
    highlight: true,
    tag: "Mais vantajoso",
    limits: {
      activeProjects: 20,
      aiReportsPerMonth: 50,
      storageGb: 10,
      whatsappSupport: true,
    },
  },
];

export const ACTIVE_PLAN_ID = "free";

export const getPlanById = (planId = ACTIVE_PLAN_ID) => (
  CONSUOBRA_PLANS.find((plan) => plan.id === planId) || CONSUOBRA_PLANS[0]
);

export const getUserPlanId = (user) => user?.plan_id || ACTIVE_PLAN_ID;

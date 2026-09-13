import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CheckCircle2, ChevronRight, DollarSign, FileText, BarChart3, Bell, Camera } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const STEPS = [
  { id: 1, title: "Dados da empresa", sub: "Vamos configurar sua conta" },
  { id: 2, title: "Primeira obra", sub: "Cadastre seu primeiro projeto (opcional)" },
  { id: 3, title: "Objetivo principal", sub: "Como você quer usar o Consuobra?" },
  { id: 4, title: "Tudo pronto!", sub: "Bem-vindo ao Consuobra" },
];

const OBJECTIVES = [
  { key: "costs", icon: DollarSign, label: "Controlar gastos", bg: "#d6ddea" },
  { key: "stages", icon: BarChart3, label: "Acompanhar etapas", bg: "#8096bc" },
  { key: "docs", icon: FileText, label: "Organizar documentos", bg: "#e7ebf4" },
  { key: "team", icon: Building2, label: "Controlar equipe", bg: "#eff2f8" },
  { key: "alerts", icon: Bell, label: "Receber alertas de atraso", bg: "#fee2e2" },
  { key: "reports", icon: Camera, label: "Gerar relatórios", bg: "#9aabcd" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    company_name: "", company_type: "", contact_name: "", phone: "",
    project_name: "", project_address: "", project_client: "",
    project_start: "", project_end: "", project_budget: "",
    objective: "",
  });

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const next = async () => {
    if (step === 1) {
      setLoading(true);
      await base44.auth.updateMe({
        company_name: data.company_name,
        company_type: data.company_type,
        full_name: data.contact_name,
        phone: data.phone,
        plan_id: "free",
        subscription_status: "free",
      }).catch(() => {});
      setLoading(false);
    }
    if (step === 2 && data.project_name) {
      setLoading(true);
      await base44.entities.Project.create({
        name: data.project_name,
        address: data.project_address || "A definir",
        client: data.project_client || data.company_name || "Próprio",
        start_date: data.project_start || null,
        expected_end_date: data.project_end || null,
        budget: data.project_budget ? parseFloat(data.project_budget) : null,
        status: "Planejamento",
        progress_percent: 0,
      });
      setLoading(false);
    }
    if (step < STEPS.length) setStep(s => s + 1);
  };

  const finish = () => navigate("/dashboard");
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "#f6f8fc" }}>
      <div className="w-full max-w-md">
        <BrandLogo size="lg" className="justify-center mb-8" />

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#e1e5ed" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "#1f3258" }} />
            </div>
            <span className="text-xs font-semibold shrink-0" style={{ color: "#778096" }}>{step}/{STEPS.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: "1.5px solid #e1e5ed" }}>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#778096" }}>Primeiros passos</p>
          <h2 className="text-2xl font-black mb-1" style={{ color: "#172441" }}>{STEPS[step - 1].title}</h2>
          <p className="text-sm mb-6" style={{ color: "#424c62" }}>{STEPS[step - 1].sub}</p>

          {/* Step 1: Empresa */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">Nome da empresa *</Label>
                <Input
                  value={data.company_name}
                  onChange={e => set("company_name", e.target.value)}
                  placeholder="Construtora Exemplo Ltda."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Tipo de empresa</Label>
                <Select value={data.company_type} onValueChange={v => set("company_type", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Construtor autônomo", "Pequena construtora", "Construtora", "Incorporadora", "Empreiteira", "Empresa de Engenharia", "Outro"].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Nome do responsável</Label>
                <Input
                  value={data.contact_name}
                  onChange={e => set("contact_name", e.target.value)}
                  placeholder="João Silva"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Telefone</Label>
                <Input
                  value={data.phone}
                  onChange={e => set("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* Step 2: Primeira obra */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl p-3 text-sm mb-2" style={{ background: "#8096bc", border: "1px solid rgba(15,22,30,0.08)", color: "#1f3258" }}>
                Esta etapa é opcional. Você pode cadastrar obras depois.
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Nome da obra</Label>
                <Input
                  value={data.project_name}
                  onChange={e => set("project_name", e.target.value)}
                  placeholder="Ex: Residencial Primavera"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Endereço</Label>
                <Input
                  value={data.project_address}
                  onChange={e => set("project_address", e.target.value)}
                  placeholder="Rua das Flores, 123 — São Paulo, SP"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Cliente</Label>
                <Input
                  value={data.project_client}
                  onChange={e => set("project_client", e.target.value)}
                  placeholder="Nome do cliente ou proprietário"
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Data de início</Label>
                  <Input type="date" value={data.project_start} onChange={e => set("project_start", e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Previsão de entrega</Label>
                  <Input type="date" value={data.project_end} onChange={e => set("project_end", e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">Orçamento previsto (R$)</Label>
                <Input
                  type="number"
                  value={data.project_budget}
                  onChange={e => set("project_budget", e.target.value)}
                  placeholder="Ex: 250000"
                  className="mt-1.5"
                />
              </div>
            </div>
          )}

          {/* Step 3: Objetivo */}
          {step === 3 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-3">O que é mais importante para você agora?</p>
              {OBJECTIVES.map(o => (
                <button
                  key={o.key}
                  onClick={() => set("objective", o.key)}
                  className="w-full text-left border-2 rounded-xl p-3.5 transition-all flex items-center gap-3"
                  style={{
                    borderColor: data.objective === o.key ? "#1f3258" : "#e1e5ed",
                    background: data.objective === o.key ? o.bg : "#ffffff",
                  }}
                >
                  <o.icon className="h-4 w-4 shrink-0" style={{ color: "#1f3258" }} />
                  <span className="text-sm font-semibold" style={{ color: "#172441" }}>{o.label}</span>
                  {data.objective === o.key && <CheckCircle2 className="h-4 w-4 ml-auto" style={{ color: "#1f3258" }} />}
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Tudo pronto */}
          {step === 4 && (
            <div className="py-2 text-center">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#8096bc" }}>
                <CheckCircle2 className="h-8 w-8" style={{ color: "#1f3258" }} />
              </div>
              <p className="text-lg font-black mb-2" style={{ color: "#172441" }}>Sua conta está pronta!</p>
              <p className="text-sm mb-6" style={{ color: "#424c62" }}>Bem-vindo ao Consuobra. Comece cadastrando ou acompanhando suas obras.</p>

              <div className="rounded-xl p-4 text-left" style={{ background: "#eff2f8" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#778096" }}>Próximos passos</p>
                <ul className="space-y-2.5">
                  {[
                    "Cadastrar uma obra",
                    "Adicionar etapas da obra",
                    "Registrar gastos",
                    "Enviar documentos",
                    "Gerar relatório",
                  ].map((s, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {i + 1}
                      </div>
                      <span className="text-sm text-gray-700">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 mt-6">
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">Voltar</Button>
            )}
            {step < 4 && (
              <Button onClick={next} disabled={loading} className="flex-1 gap-1.5">
                {loading ? "Salvando..." : "Continuar"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {step === 4 && (
              <Button onClick={finish} className="w-full gap-2">
                Ir para o Dashboard <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {step < 4 && (
            <button onClick={next} className="w-full text-xs text-gray-400 mt-3 hover:text-gray-600 transition-colors py-1">
              Pular esta etapa
            </button>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Ao continuar, você concorda com os{" "}
          <a href="/terms" className="underline hover:text-gray-600" target="_blank">Termos de Uso</a>
          {" "}e a{" "}
          <a href="/privacy" className="underline hover:text-gray-600" target="_blank">Política de Privacidade</a>.
          {" "}Seus dados são usados apenas para organizar suas obras.
        </p>
      </div>
    </div>
  );
}

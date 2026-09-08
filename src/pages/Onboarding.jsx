import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CheckCircle2, ChevronRight, DollarSign, FileText, BarChart3, Bell, Camera } from "lucide-react";

const STEPS = [
  { id: 1, title: "Dados da empresa", sub: "Vamos configurar sua conta" },
  { id: 2, title: "Primeira obra", sub: "Cadastre seu primeiro projeto (opcional)" },
  { id: 3, title: "Objetivo principal", sub: "Como você quer usar o Consuobra?" },
  { id: 4, title: "Tudo pronto!", sub: "Bem-vindo ao Consuobra" },
];

const OBJECTIVES = [
  { key: "costs", icon: DollarSign, label: "Controlar gastos", color: "text-emerald-600" },
  { key: "stages", icon: BarChart3, label: "Acompanhar etapas", color: "text-blue-600" },
  { key: "docs", icon: FileText, label: "Organizar documentos", color: "text-violet-600" },
  { key: "team", icon: Building2, label: "Controlar equipe", color: "text-orange-600" },
  { key: "alerts", icon: Bell, label: "Receber alertas de atraso", color: "text-red-600" },
  { key: "reports", icon: Camera, label: "Gerar relatórios", color: "text-gray-600" },
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-xl" style={{ color: "#123C34" }}>Consuobra</span>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-400 font-semibold shrink-0">{step}/{STEPS.length}</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-1">{STEPS[step - 1].title}</h2>
          <p className="text-sm text-gray-500 mb-6">{STEPS[step - 1].sub}</p>

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
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700 mb-2">
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
                  className={`w-full text-left border-2 rounded-xl p-3.5 transition-all flex items-center gap-3 ${
                    data.objective === o.key ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-blue-200 bg-white"
                  }`}
                >
                  <o.icon className={`h-4 w-4 shrink-0 ${data.objective === o.key ? "text-blue-600" : o.color}`} />
                  <span className="text-sm font-medium text-gray-800">{o.label}</span>
                  {data.objective === o.key && <CheckCircle2 className="h-4 w-4 text-blue-600 ml-auto" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Tudo pronto */}
          {step === 4 && (
            <div className="py-2 text-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <p className="text-lg font-black text-gray-900 mb-2">Sua conta está pronta!</p>
              <p className="text-sm text-gray-500 mb-6">Bem-vindo ao Consuobra. Comece cadastrando ou acompanhando suas obras.</p>

              <div className="bg-gray-50 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Próximos passos</p>
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
              <Button onClick={next} disabled={loading} className="flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700">
                {loading ? "Salvando..." : "Continuar"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {step === 4 && (
              <Button onClick={finish} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
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
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft, CheckCircle2, Building2, HardHat, Layers, Settings2 } from "lucide-react";
import PhaseEditor, { getTemplate } from "../components/project/PhaseEditor";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  { value: "Casa residencial", icon: Building2, desc: "Construção de residência unifamiliar", bg: "#fef1e1" },
  { value: "Prédio residencial", icon: Building2, desc: "Edificação multi-pavimento", bg: "#bee9f4" },
  { value: "Galpão industrial", icon: HardHat, desc: "Estrutura industrial ou logística", bg: "#fde8ce" },
  { value: "Obra comercial", icon: Building2, desc: "Espaço comercial ou corporativo", bg: "#e5d3f7" },
  { value: "Terraplenagem", icon: Layers, desc: "Movimentação e preparo de solo", bg: "#fef1e1" },
  { value: "Pavimentação", icon: Layers, desc: "Vias, estradas e pátios", bg: "#bee9f4" },
  { value: "Drenagem", icon: Layers, desc: "Redes de drenagem pluvial/esgoto", bg: "#fde8ce" },
  { value: "Loteamento", icon: Settings2, desc: "Parcelamento e urbanização de terra", bg: "#c6c4f4" },
  { value: "Infraestrutura urbana", icon: Building2, desc: "Obras públicas e urbanismo", bg: "#e5d3f7" },
  { value: "Reforma", icon: HardHat, desc: "Reforma ou ampliação de edificação", bg: "#fef1e1" },
  { value: "Demolição", icon: Layers, desc: "Demolição total ou parcial", bg: "#fde8ce" },
  { value: "Construção pesada", icon: HardHat, desc: "Pontes, viadutos e obras pesadas", bg: "#bee9f4" },
  { value: "Obra pública", icon: Building2, desc: "Obra licitada ou pública", bg: "#e5d3f7" },
  { value: "Obra personalizada", icon: Settings2, desc: "Defina fases do zero", bg: "#c6c4f4" },
];

const PROGRESS_METHODS = [
  { value: "Físico (quantidade)", label: "Físico", desc: "Baseado na quantidade executada por fase" },
  { value: "Financeiro (valor)", label: "Financeiro", desc: "Baseado no valor das medições aprovadas" },
  { value: "Misto", label: "Misto", desc: "Combina avanço físico e financeiro" },
  { value: "Manual", label: "Manual", desc: "Atualizado manualmente pelo gestor" },
];

const STEPS = [
  { id: 1, label: "Tipo", icon: Building2 },
  { id: 2, label: "Dados", icon: HardHat },
  { id: 3, label: "Fases", icon: Layers },
  { id: 4, label: "Revisão", icon: Settings2 },
];

const statuses = ["Planejamento", "Em andamento", "Atrasada", "Concluída", "Paralisada"];

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [step, setStep] = useState(isEdit ? 2 : 1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", address: "", client: "", technical_responsible: "",
    start_date: "", expected_end_date: "", status: "Planejamento",
    budget: "", description: "", project_type: "", progress_method: "Físico (quantidade)",
    phases: []
  });

  useEffect(() => {
    if (isEdit) {
      Promise.all([base44.entities.Project.get(id), base44.auth.me()]).then(([data, me]) => {
        if (!data || data.created_by_id !== me.id) {
          navigate("/projects");
          return;
        }
        setForm({ ...data, phases: data.phases || [] });
      });
    }
  }, [id]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const selectType = (type) => {
    const template = getTemplate(type).map(p => ({ ...p, executed_qty: 0, status: "Pendente" }));
    setForm(prev => ({ ...prev, project_type: type, phases: template }));
    setStep(2);
  };

  const totalWeight = form.phases.reduce((s, p) => s + (Number(p.weight) || 0), 0);
  const weightValid = Math.abs(totalWeight - 100) < 0.5;

  const save = async () => {
    setSaving(true);
    const data = { ...form, budget: Number(form.budget) || 0 };
    if (isEdit) await base44.entities.Project.update(id, data);
    else await base44.entities.Project.create(data);
    navigate("/projects");
  };

  const canNext2 = form.name && form.address && form.client;
  const canSave = canNext2 && (isEdit || form.project_type);

  return (
    <div className="min-h-screen" style={{ background: "#fbfaf8" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-5" style={{ background: "#0f161e" }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/projects")} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-black text-base">{isEdit ? "Editar Obra" : "Nova Obra"}</h1>
            <p className="text-white/50 text-xs">Consuobra · Obra sob controle</p>
          </div>
        </div>

        {/* Step indicator */}
        {!isEdit && (
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full text-xs font-black transition-all shrink-0",
                  step > s.id ? "bg-[#004038] text-white" :
                  step === s.id ? "bg-[#fef1e1] text-[#004038]" :
                  "bg-white/10 text-white/40"
                )}>
                  {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                </div>
                <p className={cn("text-[10px] ml-1 font-semibold hidden sm:block", step >= s.id ? "text-white/80" : "text-white/30")}>{s.label}</p>
                {i < STEPS.length - 1 && <div className={cn("flex-1 h-px mx-2", step > s.id ? "bg-[#fef1e1]/70" : "bg-white/10")} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">

        {/* STEP 1 — Tipo de Obra */}
        {step === 1 && !isEdit && (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#6f7073" }}>Nova obra</p>
              <h2 className="text-2xl font-black" style={{ color: "#0f161e" }}>Qual o tipo de obra?</h2>
              <p className="text-sm mt-1" style={{ color: "#3d3e45" }}>O sistema vai sugerir fases e indicadores adaptados ao tipo escolhido.</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {PROJECT_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                <button
                  key={t.value}
                  onClick={() => selectType(t.value)}
                  className={cn(
                    "flex flex-col items-start gap-2 p-3.5 rounded-2xl border-2 text-left transition-all hover:border-[#004038]",
                    form.project_type === t.value
                      ? "border-[#004038]"
                      : "border-[#efefef]"
                  )}
                  style={{ background: form.project_type === t.value ? "#fef1e1" : t.bg }}
                >
                  <Icon className="h-5 w-5" style={{ color: "#004038" }} />
                  <p className="text-sm font-black leading-tight" style={{ color: "#0f161e" }}>{t.value}</p>
                  <p className="text-[10px] leading-snug" style={{ color: "#3d3e45" }}>{t.desc}</p>
                </button>
              )})}
            </div>
          </div>
        )}

        {/* STEP 2 — Dados básicos */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black" style={{ color: "#0f161e" }}>Dados da obra</h2>
              {form.project_type && <p className="text-sm text-muted-foreground mt-1">Tipo: <span className="font-semibold text-primary">{form.project_type}</span></p>}
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Nome da Obra *</Label>
                  <Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Terraplenagem Lote 07 – Vila Nova" />
                </div>
                <div>
                  <Label>Cliente *</Label>
                  <Input className="mt-1" value={form.client} onChange={e => set("client", e.target.value)} />
                </div>
                <div>
                  <Label>Responsável Técnico</Label>
                  <Input className="mt-1" value={form.technical_responsible} onChange={e => set("technical_responsible", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Endereço *</Label>
                  <Input className="mt-1" value={form.address} onChange={e => set("address", e.target.value)} />
                </div>
                <div>
                  <Label>Data de Início</Label>
                  <Input className="mt-1" type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
                </div>
                <div>
                  <Label>Prazo Previsto</Label>
                  <Input className="mt-1" type="date" value={form.expected_end_date} onChange={e => set("expected_end_date", e.target.value)} />
                </div>
                <div>
                  <Label>Orçamento (R$)</Label>
                  <Input className="mt-1" type="number" value={form.budget} onChange={e => set("budget", e.target.value)} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => set("status", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea className="mt-1" value={form.description} onChange={e => set("description", e.target.value)} rows={3} />
              </div>
            </div>

            <div className="flex gap-3">
              {!isEdit && <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4" />Voltar</Button>}
              <Button
                onClick={() => isEdit ? save() : setStep(3)}
                disabled={!canNext2 || (isEdit && saving)}
                className="flex-1"
              >
                {isEdit ? (saving ? "Salvando..." : "Salvar Alterações") : "Próximo: Fases"}
                {!isEdit && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 — Fases */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black" style={{ color: "#0f161e" }}>Fases da obra</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Template carregado para <strong>{form.project_type}</strong>. Edite conforme necessário — os pesos devem somar 100%.
              </p>
            </div>

            {/* Método de progresso */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Método de Cálculo do Progresso</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {PROGRESS_METHODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => set("progress_method", m.value)}
                    className="p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: form.progress_method === m.value ? "#004038" : "#efefef",
                      background: form.progress_method === m.value ? "#fef1e1" : "#ffffff",
                    }}
                  >
                    <p className="text-xs font-bold">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <PhaseEditor
              phases={form.phases}
              onChange={phases => set("phases", phases)}
              projectType={form.project_type}
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4" />Voltar</Button>
              <Button onClick={() => setStep(4)} className="flex-1" disabled={!weightValid}>
                Revisar e Salvar <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 — Revisão */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-black" style={{ color: "#0f161e" }}>Revisão final</h2>
              <p className="text-sm text-muted-foreground">Confirme os dados antes de criar a obra.</p>
            </div>

            <div className="space-y-3">
              {/* Summary card */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                    {(() => {
                      const Icon = PROJECT_TYPES.find(t => t.value === form.project_type)?.icon || Building2;
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-black text-sm">{form.name}</p>
                    <p className="text-xs text-muted-foreground">{form.project_type} · {form.client}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-muted-foreground">Endereço</p>
                    <p className="font-semibold truncate">{form.address}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-muted-foreground">Orçamento</p>
                    <p className="font-semibold">{form.budget ? `R$ ${Number(form.budget).toLocaleString("pt-BR")}` : "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-muted-foreground">Início</p>
                    <p className="font-semibold">{form.start_date || "—"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-muted-foreground">Prazo</p>
                    <p className="font-semibold">{form.expected_end_date || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Phases summary */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-bold">{form.phases.length} fases · {form.progress_method}</p>
                </div>
                <div className="divide-y divide-border">
                  {form.phases.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5">
                      <p className="text-sm">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{p.contracted_qty} {p.unit}</span>
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-lg">{p.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)}><ChevronLeft className="h-4 w-4" />Voltar</Button>
              <Button onClick={save} disabled={saving || !canSave} className="flex-1">
                {saving ? "Criando obra..." : "Criar obra"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

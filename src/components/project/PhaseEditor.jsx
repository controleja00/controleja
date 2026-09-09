import { useState } from "react";
import { Plus, Trash2, AlertTriangle, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const UNITS = ["m²", "m³", "metro linear", "unidade", "diária", "tonelada", "%", "hora máquina"];

const TEMPLATES = {
  "Terraplenagem": [
    { name: "Mobilização", weight: 5, unit: "unidade", contracted_qty: 1 },
    { name: "Limpeza do terreno", weight: 10, unit: "m²", contracted_qty: 0 },
    { name: "Corte", weight: 25, unit: "m³", contracted_qty: 0 },
    { name: "Aterro", weight: 25, unit: "m³", contracted_qty: 0 },
    { name: "Compactação", weight: 20, unit: "m³", contracted_qty: 0 },
    { name: "Nivelamento", weight: 10, unit: "m²", contracted_qty: 0 },
    { name: "Finalização", weight: 5, unit: "unidade", contracted_qty: 1 },
  ],
  "Pavimentação": [
    { name: "Regularização do subleito", weight: 10, unit: "m²", contracted_qty: 0 },
    { name: "Sub-base", weight: 15, unit: "m²", contracted_qty: 0 },
    { name: "Base", weight: 20, unit: "m²", contracted_qty: 0 },
    { name: "Imprimação", weight: 10, unit: "m²", contracted_qty: 0 },
    { name: "Capa asfáltica", weight: 30, unit: "m²", contracted_qty: 0 },
    { name: "Sinalização", weight: 10, unit: "metro linear", contracted_qty: 0 },
    { name: "Finalização", weight: 5, unit: "unidade", contracted_qty: 1 },
  ],
  "Casa residencial": [
    { name: "Projeto e documentação", weight: 5, unit: "%", contracted_qty: 100 },
    { name: "Fundação", weight: 15, unit: "m³", contracted_qty: 0 },
    { name: "Estrutura", weight: 20, unit: "m³", contracted_qty: 0 },
    { name: "Alvenaria", weight: 15, unit: "m²", contracted_qty: 0 },
    { name: "Cobertura", weight: 10, unit: "m²", contracted_qty: 0 },
    { name: "Instalações", weight: 10, unit: "%", contracted_qty: 100 },
    { name: "Revestimento", weight: 10, unit: "m²", contracted_qty: 0 },
    { name: "Acabamento", weight: 10, unit: "%", contracted_qty: 100 },
    { name: "Entrega", weight: 5, unit: "unidade", contracted_qty: 1 },
  ],
  "Prédio residencial": [
    { name: "Projeto e licenças", weight: 5, unit: "%", contracted_qty: 100 },
    { name: "Fundação e estacas", weight: 15, unit: "m³", contracted_qty: 0 },
    { name: "Estrutura", weight: 25, unit: "m³", contracted_qty: 0 },
    { name: "Alvenaria", weight: 15, unit: "m²", contracted_qty: 0 },
    { name: "Cobertura", weight: 8, unit: "m²", contracted_qty: 0 },
    { name: "Instalações elétricas/hidráulicas", weight: 12, unit: "%", contracted_qty: 100 },
    { name: "Revestimento e acabamento", weight: 12, unit: "m²", contracted_qty: 0 },
    { name: "Entrega", weight: 8, unit: "unidade", contracted_qty: 1 },
  ],
  "Loteamento": [
    { name: "Topografia", weight: 5, unit: "%", contracted_qty: 100 },
    { name: "Terraplenagem", weight: 20, unit: "m³", contracted_qty: 0 },
    { name: "Drenagem", weight: 15, unit: "metro linear", contracted_qty: 0 },
    { name: "Rede de água", weight: 10, unit: "metro linear", contracted_qty: 0 },
    { name: "Rede de esgoto", weight: 10, unit: "metro linear", contracted_qty: 0 },
    { name: "Guias e sarjetas", weight: 10, unit: "metro linear", contracted_qty: 0 },
    { name: "Pavimentação", weight: 20, unit: "m²", contracted_qty: 0 },
    { name: "Sinalização", weight: 5, unit: "unidade", contracted_qty: 0 },
    { name: "Entrega", weight: 5, unit: "unidade", contracted_qty: 1 },
  ],
  "Drenagem": [
    { name: "Mobilização", weight: 5, unit: "unidade", contracted_qty: 1 },
    { name: "Escavação de valas", weight: 25, unit: "m³", contracted_qty: 0 },
    { name: "Assentamento de tubos", weight: 30, unit: "metro linear", contracted_qty: 0 },
    { name: "Reaterro", weight: 20, unit: "m³", contracted_qty: 0 },
    { name: "Caixas e bocas de lobo", weight: 15, unit: "unidade", contracted_qty: 0 },
    { name: "Finalização", weight: 5, unit: "unidade", contracted_qty: 1 },
  ],
  "Galpão industrial": [
    { name: "Terraplenagem", weight: 10, unit: "m³", contracted_qty: 0 },
    { name: "Fundação", weight: 15, unit: "m³", contracted_qty: 0 },
    { name: "Estrutura metálica", weight: 30, unit: "tonelada", contracted_qty: 0 },
    { name: "Cobertura e fechamento", weight: 20, unit: "m²", contracted_qty: 0 },
    { name: "Piso industrial", weight: 15, unit: "m²", contracted_qty: 0 },
    { name: "Instalações", weight: 7, unit: "%", contracted_qty: 100 },
    { name: "Entrega", weight: 3, unit: "unidade", contracted_qty: 1 },
  ],
  "Reforma": [
    { name: "Demolição seletiva", weight: 15, unit: "m²", contracted_qty: 0 },
    { name: "Estrutura e reforços", weight: 15, unit: "%", contracted_qty: 100 },
    { name: "Alvenaria", weight: 15, unit: "m²", contracted_qty: 0 },
    { name: "Instalações", weight: 20, unit: "%", contracted_qty: 100 },
    { name: "Revestimento", weight: 20, unit: "m²", contracted_qty: 0 },
    { name: "Acabamento", weight: 10, unit: "%", contracted_qty: 100 },
    { name: "Entrega", weight: 5, unit: "unidade", contracted_qty: 1 },
  ],
};

const DEFAULT_PHASES = [
  { name: "Fase 1", weight: 50, unit: "m²", contracted_qty: 0 },
  { name: "Fase 2", weight: 50, unit: "m²", contracted_qty: 0 },
];

function getTemplate(type) {
  return TEMPLATES[type] || DEFAULT_PHASES;
}

export { getTemplate, TEMPLATES };

export default function PhaseEditor({ phases, onChange, projectType }) {
  const [expanded, setExpanded] = useState(null);

  const totalWeight = phases.reduce((s, p) => s + (Number(p.weight) || 0), 0);
  const isValid = Math.abs(totalWeight - 100) < 0.1;

  const update = (idx, field, value) => {
    const next = phases.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    onChange(next);
  };

  const remove = (idx) => {
    onChange(phases.filter((_, i) => i !== idx));
  };

  const add = () => {
    const remaining = Math.max(0, 100 - totalWeight);
    onChange([...phases, { name: "Nova fase", weight: remaining, unit: "m²", contracted_qty: 0, executed_qty: 0, status: "Pendente" }]);
    setExpanded(phases.length);
  };

  return (
    <div className="space-y-3">
      {/* Weight summary */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold",
        isValid ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
      )}>
        <div className="flex items-center gap-2">
          {!isValid && <AlertTriangle className="h-4 w-4" />}
          <span>Soma dos pesos: <strong>{totalWeight.toFixed(0)}%</strong></span>
        </div>
        {!isValid && <span className="text-xs">A soma deve ser 100%</span>}
        {isValid && <span className="text-xs text-emerald-600">✓ Distribuição válida</span>}
      </div>

      {/* Weight bar visualization */}
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex">
        {phases.map((p, i) => {
          const colors = ["bg-secondary0", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500"];
          return (
            <div
              key={i}
              className={cn("h-full transition-all", colors[i % colors.length])}
              style={{ width: `${Math.min(Number(p.weight) || 0, 100)}%` }}
              title={`${p.name}: ${p.weight}%`}
            />
          );
        })}
      </div>

      {/* Phase list */}
      <div className="space-y-2">
        {phases.map((phase, idx) => (
          <div key={idx} className="border border-border rounded-xl bg-card overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => setExpanded(expanded === idx ? null : idx)}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{phase.name || "Sem nome"}</p>
                <p className="text-xs text-muted-foreground">{phase.unit} · {phase.contracted_qty || 0} contratado</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-primary/10 text-primary text-xs font-black px-2 py-0.5 rounded-lg">{phase.weight}%</div>
                {expanded === idx ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>

            {expanded === idx && (
              <div className="px-4 pb-4 pt-1 border-t border-border space-y-3 bg-muted/20">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome da Fase</label>
                    <Input
                      value={phase.name}
                      onChange={e => update(idx, "name", e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Peso (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={phase.weight}
                      onChange={e => update(idx, "weight", Number(e.target.value))}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unidade</label>
                    <select
                      value={phase.unit}
                      onChange={e => update(idx, "unit", e.target.value)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qtd Contratada</label>
                    <Input
                      type="number"
                      value={phase.contracted_qty}
                      onChange={e => update(idx, "contracted_qty", Number(e.target.value))}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</label>
                    <Input
                      value={phase.responsible || ""}
                      onChange={e => update(idx, "responsible", e.target.value)}
                      placeholder="Engenheiro / Encarregado"
                      className="mt-1 h-9"
                    />
                  </div>
                </div>
                <button
                  onClick={() => remove(idx)}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover fase
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary/30 rounded-xl text-primary text-sm font-semibold hover:border-primary/60 hover:bg-primary/5 transition-all"
      >
        <Plus className="h-4 w-4" />
        Adicionar fase
      </button>
    </div>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, Ruler, TrendingUp, TrendingDown, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { icon: Ruler, label: "Nova medição", to: "/measurements/new", bg: "#1f3258" },
  { icon: TrendingUp, label: "Entrada de caixa", to: "/cash-flow", bg: "#1d0953" },
  { icon: TrendingDown, label: "Saída de caixa", to: "/cash-flow", bg: "#172441" },
  { icon: Zap, label: "Autopiloto", to: "/autopilot", bg: "#1f3258" },
  { icon: FileText, label: "Relatórios", to: "/reports", bg: "#424c62" },
];

export default function QuickActionFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-[#172441]/30 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      {/* Action items */}
      <div className="fixed right-4 z-50 flex flex-col items-end gap-2.5" style={{ bottom: "calc(4rem + 72px)" }}>
        {ACTIONS.map((action, i) => (
          <div key={action.label} className={cn("flex items-center gap-2.5 transition-all duration-200", open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")} style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap" style={{ background: "#FFFFFF", color: "#1f3258", border: "1px solid #e1e5ed" }}>
              {action.label}
            </span>
            <Link to={action.to} onClick={() => setOpen(false)} className="h-11 w-11 rounded-2xl flex items-center justify-center text-white transition-transform active:scale-95" style={{ background: action.bg }}>
              <action.icon className="h-5 w-5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button onClick={() => setOpen(v => !v)} className="fixed right-4 z-50 h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95"
        style={{ bottom: "calc(4rem + 12px)", background: open ? "#172441" : "#1f3258", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
        {open ? <X className="h-6 w-6 text-white" /> : <Plus className="h-7 w-7 text-[#e1e5ed]" />}
      </button>
    </>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronLeft, Bell, HardHat } from "lucide-react";
import { base44 } from "@/api/base44Client";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/projects": "Obras",
  "/subcontractors": "Equipe",
  "/cash-flow": "Gastos",
  "/alerts": "Alertas",
  "/settings": "Configurações",
  "/measurements": "Medições",
  "/documents": "Documentos",
  "/hiring": "Contratar",
  "/reports": "Relatórios",
  "/supplies": "Suprimentos",
  "/admin": "Administração",
  "/support": "Suporte",
  "/ai-assistant": "Assistente IA",
  "/ai-audit": "Auditoria IA",
  "/risk-predictor": "Risco Preditivo",
  "/ranking": "Ranking",
  "/benchmark": "Benchmark",
  "/anti-fraud": "Anti-Fraude",
  "/contract-analysis": "Contratos",
  "/guarantees": "Garantias",
  "/recommendations": "Recomendações",
  "/audit-logs": "Auditoria",
  "/autopilot": "Autopiloto",
};

const rootPages = ["/dashboard", "/projects", "/subcontractors", "/cash-flow", "/alerts", "/settings"];

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    base44.entities.Alert.filter({ is_resolved: false }).then((alerts) => {
      setAlertCount(alerts.filter((a) => a.severity === "Crítica" || a.severity === "Alta").length);
    }).catch(() => {});
  }, [path]);

  const isRoot = rootPages.some((r) => path === r);
  const title = Object.entries(pageTitles).find(([k]) => path === k || path.startsWith(k + "/"))?.[1] || "ControleJá";

  useEffect(() => {
    const baseTitle = "ControleJá";
    document.title = title && title !== baseTitle ? `${title} | ${baseTitle}` : baseTitle;
  }, [title]);

  return (
    <header className="sticky top-0 z-30 bg-busk-navy border-b border-white/10 shadow-lg">
      <div className="flex items-center h-14 px-4 gap-3">
        {!isRoot ?
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors -ml-1">
          
            <ChevronLeft className="h-5 w-5 text-white" />
          </button> :

        <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-busk-blue-light/20 border border-busk-blue-light/30 flex items-center justify-center">
              <HardHat className="h-4 w-4 text-busk-blue-light" />
            </div>
            <div className="leading-none">
              <p className="text-white font-black text-sm tracking-tight">ControleJá</p>
              <p className="text-white/40 text-[9px] font-semibold uppercase tracking-widest">Grupo Busk</p>
            </div>
          </div>
        }

        <h1 className={`flex-1 font-bold text-base text-white ${isRoot ? "hidden sm:block" : ""}`}>
          {!isRoot && title}
        </h1>

        <div className="flex items-center gap-1 ml-auto">
          <Link
            to="/alerts"
            className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
            
            <Bell className="h-4.5 w-4.5 text-white/70" />
            {alertCount > 0 &&
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            }
          </Link>
        </div>
      </div>
    </header>);

}
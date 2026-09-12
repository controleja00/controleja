import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronLeft, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/BrandLogo";

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
    base44.auth.me().then((me) => {
      return base44.entities.Alert.filter({ is_resolved: false, created_by_id: me.id });
    }).then((alerts) => {
      setAlertCount(alerts.filter((a) => a.severity === "Crítica" || a.severity === "Alta").length);
    }).catch(() => {});
  }, [path]);

  const isRoot = rootPages.some((r) => path === r);
  const title = Object.entries(pageTitles).find(([k]) => path === k || path.startsWith(k + "/"))?.[1] || "Consuobra";

  useEffect(() => {
    const baseTitle = "Consuobra";
    document.title = title && title !== baseTitle ? `${title} | ${baseTitle}` : baseTitle;
  }, [title]);

  return (
    <header className="sticky top-0 z-30 border-b" style={{ background: "rgba(246,248,252,0.96)", borderColor: "#e1e5ed", backdropFilter: "blur(14px)" }}>
      <div className="flex items-center h-14 px-4 gap-3">
        {!isRoot ?
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors -ml-1">
          
            <ChevronLeft className="h-5 w-5 text-[#1f3258]" />
          </button> :

          <BrandLogo size="sm" to="/dashboard" />
        }

        <h1 className={`flex-1 font-bold text-base text-[#172441] ${isRoot ? "hidden sm:block" : ""}`}>
          {!isRoot && title}
        </h1>

        <div className="flex items-center gap-1 ml-auto">
          <Link
            to="/alerts"
            className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-[#e1e5ed] transition-colors">
            
            <Bell className="h-4.5 w-4.5 text-[#1f3258]" />
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

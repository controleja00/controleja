import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, DollarSign, FileText, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/dashboard", label: "Início", icon: LayoutDashboard },
  { path: "/projects", label: "Obras", icon: Building2 },
  { path: "/cash-flow", label: "Gastos", icon: DollarSign },
  { path: "/documents", label: "Documentos", icon: FileText },
  { path: "/alerts", label: "Alertas", icon: Bell },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 shadow-2xl safe-area-inset-bottom" style={{ background: "linear-gradient(135deg, #101A18 0%, #123C34 100%)" }}>
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path || (tab.path !== "/dashboard" && location.pathname.startsWith(tab.path));
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all duration-200",
                active ? "text-white" : "text-white/45"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200",
                active ? "bg-[#E5A936]/20 text-[#E5A936]" : ""
              )}>
                <tab.icon
                  className={cn("h-5 w-5 transition-all", active ? "text-[#E5A936]" : "text-white/45")}
                  strokeWidth={active ? 2.5 : 1.75}
                />
              </div>
              <span className={cn("text-[10px] font-semibold transition-all", active ? "text-white" : "text-white/35")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

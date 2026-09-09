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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t safe-area-inset-bottom" style={{ background: "#ffffff", borderColor: "#efefef" }}>
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path || (tab.path !== "/dashboard" && location.pathname.startsWith(tab.path));
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all duration-200",
                active ? "text-[#004038]" : "text-[#6f7073]"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200",
                active ? "bg-[#e5d3f7] text-[#004038]" : ""
              )}>
                <tab.icon
                  className={cn("h-5 w-5 transition-all", active ? "text-[#004038]" : "text-[#6f7073]")}
                  strokeWidth={active ? 2.5 : 1.75}
                />
              </div>
              <span className={cn("text-[10px] font-semibold transition-all", active ? "text-[#004038]" : "text-[#6f7073]")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Link } from "react-router-dom";

const sizeClasses = {
  sm: { mark: "h-7 w-7", name: "text-base", tag: "text-[8px]" },
  md: { mark: "h-9 w-9", name: "text-lg", tag: "text-[9px]" },
  lg: { mark: "h-11 w-11", name: "text-xl", tag: "text-[10px]" },
};

export function BrandMark({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="16" fill="#123C34" />
      <path d="M16 34L32 20l16 14" fill="none" stroke="#DCE6E1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 32v14h20V32" fill="none" stroke="#DCE6E1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 42h14" stroke="#E5A936" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M49 18l-7 7-4-4" fill="none" stroke="#E5A936" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 50h36" stroke="#668078" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function BrandLogo({ to = "/", size = "md", light = false, className = "" }) {
  const s = sizeClasses[size] || sizeClasses.md;
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${s.mark} rounded-2xl shadow-sm overflow-hidden shrink-0`}>
        <BrandMark className="h-full w-full" />
      </div>
      <div className="leading-none min-w-0">
        <p className={`${s.name} font-black tracking-tight ${light ? "text-white" : "text-[#123C34]"}`}>Consuobra</p>
        <p className={`${s.tag} font-semibold uppercase tracking-widest ${light ? "text-white/45" : "text-[#668078]"}`}>Obra sob controle</p>
      </div>
    </div>
  );

  if (!to) return content;
  return <Link to={to}>{content}</Link>;
}

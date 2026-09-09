export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-6 border-b" style={{ background: "#fbfaf8", borderColor: "#efefef" }}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#6f7073" }}>Consuobra</p>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: "#0f161e" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1 max-w-2xl" style={{ color: "#3d3e45" }}>{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

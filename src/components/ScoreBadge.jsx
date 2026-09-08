import { cn } from "@/lib/utils";

export default function ScoreBadge({ score, size = "md" }) {
  const getColor = (s) => {
    if (s >= 80) return "bg-emerald-500 text-white";
    if (s >= 60) return "bg-amber-500 text-white";
    if (s >= 40) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const sizeClass = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";

  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold", getColor(score || 0), sizeClass)}>
      {Math.round(score || 0)}
    </div>
  );
}
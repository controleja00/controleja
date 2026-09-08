import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Trophy, Medal, Star, Award } from "lucide-react";
import ScoreBadge from "../components/ScoreBadge";
import PageHeader from "../components/PageHeader";

const SPECIALTIES = ["Todos", "Terraplenagem", "Drenagem", "Pavimentação", "Alvenaria", "Acabamento", "Estrutura", "Instalações"];

const getBadge = (rank) => {
  if (rank === 1) return { icon: Trophy, color: "text-yellow-500", label: "Ouro" };
  if (rank === 2) return { icon: Medal, color: "text-gray-400", label: "Prata" };
  if (rank === 3) return { icon: Medal, color: "text-amber-700", label: "Bronze" };
  return null;
};

const getLevel = (score) => {
  if (score >= 90) return { label: "Diamante", color: "bg-blue-100 text-blue-700", icon: "💎" };
  if (score >= 75) return { label: "Platina", color: "bg-purple-100 text-purple-700", icon: "🏆" };
  if (score >= 60) return { label: "Ouro", color: "bg-yellow-100 text-yellow-700", icon: "⭐" };
  if (score >= 40) return { label: "Prata", color: "bg-gray-100 text-gray-700", icon: "🥈" };
  return { label: "Bronze", color: "bg-amber-100 text-amber-700", icon: "🥉" };
};

export default function Ranking() {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Subcontractor.list().then(d => { setSubs(d); setLoading(false); });
  }, []);

  const filtered = [...(filter === "Todos" ? subs : subs.filter(s => s.specialty === filter))]
    .sort((a, b) => (b.score_total || 0) - (a.score_total || 0));

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div>
      <PageHeader title="Ranking Nacional" subtitle="Os melhores subempreiteiros classificados por score de confiabilidade" />
      <div className="p-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SPECIALTIES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`whitespace-nowrap text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>{s}</button>
          ))}
        </div>

        {filtered.length >= 3 && (
          <div className="grid grid-cols-3 gap-3">
            {[filtered[1], filtered[0], filtered[2]].map((sub, i) => {
              if (!sub) return <div key={i} />;
              const rankMap = [2, 1, 3];
              const rank = rankMap[i];
              const badge = getBadge(rank);
              const level = getLevel(sub.score_total || 0);
              return (
                <Link key={sub.id} to={`/subcontractors/${sub.id}`} className={`bg-card border-2 rounded-xl p-4 text-center flex flex-col items-center gap-2 hover:shadow-md transition-all ${rank === 1 ? "border-yellow-400 scale-105" : "border-border"}`}>
                  {badge && <badge.icon className={`h-6 w-6 ${badge.color}`} />}
                  <ScoreBadge score={sub.score_total} size={rank === 1 ? "lg" : "md"} />
                  <p className="text-xs font-semibold leading-tight">{sub.company_name}</p>
                  <p className="text-[10px] text-muted-foreground">{sub.specialty}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${level.color}`}>{level.icon} {level.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.map((sub, i) => {
              const rank = i + 1;
              const badge = getBadge(rank);
              const level = getLevel(sub.score_total || 0);
              return (
                <Link key={sub.id} to={`/subcontractors/${sub.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                  <span className={`text-sm font-bold w-6 text-center ${rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>#{rank}</span>
                  {badge ? <badge.icon className={`h-4 w-4 ${badge.color} shrink-0`} /> : <div className="w-4" />}
                  <ScoreBadge score={sub.score_total} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{sub.company_name}</p>
                    <p className="text-xs text-muted-foreground">{sub.specialty} · {sub.city || "—"}/{sub.state || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${level.color}`}>{level.icon} {level.label}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sub.status === "Ativo" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{sub.status}</span>
                  </div>
                </Link>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhum subempreiteiro encontrado</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Award className="h-4 w-4 text-primary" />Níveis de Certificação</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[{ l: "Bronze", c: "bg-amber-100 text-amber-700", i: "🥉", d: "Score 0–39" }, { l: "Prata", c: "bg-gray-100 text-gray-700", i: "🥈", d: "Score 40–59" }, { l: "Ouro", c: "bg-yellow-100 text-yellow-700", i: "⭐", d: "Score 60–74" }, { l: "Platina", c: "bg-purple-100 text-purple-700", i: "🏆", d: "Score 75–89" }, { l: "Diamante", c: "bg-blue-100 text-blue-700", i: "💎", d: "Score 90–100" }].map(n => (
              <div key={n.l} className={`rounded-lg p-3 text-center ${n.c}`}>
                <p className="text-xl">{n.i}</p>
                <p className="text-xs font-bold mt-1">{n.l}</p>
                <p className="text-[10px] opacity-70">{n.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import ScoreBadge from "../components/ScoreBadge";
import PageHeader from "../components/PageHeader";

export default function SubcontractorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    base44.entities.Subcontractor.get(id).then(setSub);
    base44.entities.Document.filter({ subcontractor_id: id }).then(setDocs);
  }, [id]);

  if (!sub) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  const handleDelete = async () => {
    if (confirm("Deseja realmente excluir este subempreiteiro?")) {
      await base44.entities.Subcontractor.delete(id);
      navigate("/subcontractors");
    }
  };

  const scores = [
    { label: "Operacional", value: sub.score_operational },
    { label: "Técnico", value: sub.score_technical },
    { label: "Jurídico", value: sub.score_legal },
    { label: "Financeiro", value: sub.score_financial },
    { label: "Comportamental", value: sub.score_behavioral },
  ];

  return (
    <div>
      <PageHeader title={sub.company_name} subtitle={sub.specialty}>
        <Link to="/subcontractors"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button></Link>
        <Link to={`/subcontractors/${id}/edit`}><Button variant="outline" size="sm"><Pencil className="h-4 w-4 mr-1" />Editar</Button></Link>
        <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-1" />Excluir</Button>
      </PageHeader>
      <div className="p-6 space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col sm:flex-row items-start gap-6">
          <ScoreBadge score={sub.score_total} size="lg" />
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm flex-1">
            <div><span className="text-muted-foreground">CNPJ:</span> <span className="font-medium">{sub.cnpj}</span></div>
            <div><span className="text-muted-foreground">Responsável:</span> <span className="font-medium">{sub.contact_name}</span></div>
            <div><span className="text-muted-foreground">Telefone:</span> <span className="font-medium">{sub.phone || "—"}</span></div>
            <div><span className="text-muted-foreground">E-mail:</span> <span className="font-medium">{sub.email || "—"}</span></div>
            <div><span className="text-muted-foreground">Local:</span> <span className="font-medium">{sub.city || "—"}, {sub.state || "—"}</span></div>
            <div><span className="text-muted-foreground">Funcionários:</span> <span className="font-medium">{sub.employee_count || "—"}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className={`font-medium ${sub.status === "Ativo" ? "text-emerald-600" : "text-amber-600"}`}>{sub.status}</span></div>
            <div><span className="text-muted-foreground">Disponibilidade:</span> <span className="font-medium">{sub.availability}</span></div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-sm mb-4">Score de Confiabilidade</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {scores.map(s => (
              <div key={s.label} className="text-center">
                <div className="mx-auto mb-1"><ScoreBadge score={s.value} size="sm" /></div>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm">Documentos ({docs.length})</h3>
            <Link to={`/documents?sub=${id}`}><Button variant="outline" size="sm">Ver todos</Button></Link>
          </div>
          <div className="divide-y divide-border">
            {docs.length === 0 && <p className="text-sm text-muted-foreground p-5">Nenhum documento</p>}
            {docs.slice(0, 5).map(d => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{d.type}</p>
                  <p className="text-xs text-muted-foreground">{d.expiry_date ? `Vence: ${d.expiry_date}` : "Sem vencimento"}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${d.status === "Aprovado" ? "bg-emerald-50 text-emerald-700" : d.status === "Vencido" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
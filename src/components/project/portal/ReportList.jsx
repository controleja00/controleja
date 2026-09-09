import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Camera, ChevronDown, ChevronUp, Edit2, Eye, EyeOff, FileText, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

const STATUS_STYLE = {
  Rascunho: "bg-gray-100 text-gray-600",
  Revisado: "bg-secondary text-primary",
  Publicado: "bg-emerald-100 text-emerald-700",
  Oculto: "bg-red-100 text-red-500",
};

const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function ReportCard({ report, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(report.ai_report || "");
  const [saving, setSaving] = useState(false);

  const save = async (patch) => {
    setSaving(true);
    await base44.entities.DailyReport.update(report.id, patch);
    onUpdate();
    setSaving(false);
    setEditing(false);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(report.project_name || "Relatório de Obra", 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Data: ${fmtDate(report.report_date)}`, 14, 28);
    doc.text(`Etapa: ${report.phase || "—"}`, 14, 36);
    doc.text(`Responsável: ${report.sent_by || "—"}`, 14, 44);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text || "Sem relatório.", 182);
    doc.text(lines, 14, 56);
    doc.save(`relatorio-${report.report_date}.pdf`);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-gray-900">{fmtDate(report.report_date)}</span>
            {report.phase && <span className="text-xs text-gray-400 font-medium">· {report.phase}</span>}
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[report.status] || STATUS_STYLE.Rascunho}`}>
              {report.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Por {report.sent_by || "—"} · {report.photos?.length || 0} foto(s)</p>
          {report.observation && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{report.observation}</p>}
        </div>
        <div className="shrink-0 text-gray-300">{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Photos */}
          {report.photos?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><Camera className="h-3.5 w-3.5" />Fotos</p>
              <div className="grid grid-cols-4 gap-2">
                {report.photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden bg-gray-100 block">
                    <img src={url} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Report */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Relatório</p>
            {editing ? (
              <textarea value={text} onChange={e => setText(e.target.value)} rows={8} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs outline-none resize-none" />
            ) : (
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{text || "Sem relatório gerado."}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {editing ? (
              <Button size="sm" onClick={() => save({ ai_report: text, status: "Revisado" })} disabled={saving} className="h-8 text-xs gap-1 bg-primary hover:bg-[#172441]">
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Salvar"}
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 text-xs gap-1">
                <Edit2 className="h-3 w-3" />Editar
              </Button>
            )}
            {report.status !== "Publicado" ? (
              <Button size="sm" onClick={() => save({ status: "Publicado" })} disabled={saving} className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                <Eye className="h-3 w-3" />Publicar
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => save({ status: "Oculto" })} disabled={saving} className="h-8 text-xs gap-1 text-red-500 border-red-200">
                <EyeOff className="h-3 w-3" />Ocultar
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={exportPdf} className="h-8 text-xs gap-1">
              <FileText className="h-3 w-3" />PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(report.id)} className="h-8 text-xs gap-1 text-red-400 hover:text-red-600 ml-auto">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportList({ reports, onUpdate }) {
  const handleDelete = async (id) => {
    if (!confirm("Excluir este relatório?")) return;
    await base44.entities.DailyReport.delete(id);
    onUpdate();
  };

  if (reports.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm font-medium">Nenhum relatório ainda</p>
      <p className="text-xs mt-1">Envie fotos do dia para gerar o primeiro relatório.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {reports.map(r => (
        <ReportCard key={r.id} report={r} onUpdate={onUpdate} onDelete={handleDelete} />
      ))}
    </div>
  );
}
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, FileText, Upload, AlertTriangle, CheckCircle2, Clock, X, ExternalLink } from "lucide-react";
import PageHeader from "../components/PageHeader";

const DOC_TYPES = ["Contrato", "Nota Fiscal", "Alvará", "ART/RRT", "Comprovante", "Certidão Negativa", "Seguro", "Documento de Equipe", "Documento de Subempreiteiro", "Outro"];

const palette = {
  ink: "#172441",
  navy: "#1f3258",
  steel: "#8096bc",
  soft: "#e7ebf4",
  canvas: "#f6f8fc",
  line: "#e1e5ed",
  text: "#424c62",
  muted: "#778096",
};

const statusConfig = {
  Aprovado: { bg: "#edf2f8", text: palette.navy, icon: CheckCircle2 },
  Pendente: { bg: "#f1f3f7", text: palette.text, icon: Clock },
  Vencido: { bg: "#fff1f2", text: "#9f1239", icon: AlertTriangle },
  Reprovado: { bg: "#f3f4f6", text: "#4b5563", icon: X },
};

function Loading() {
  return (
    <div className="flex h-64 items-center justify-center" style={{ background: palette.canvas }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: palette.line, borderTopColor: palette.navy }} />
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: tone, borderColor: "rgba(23,36,65,0.08)" }}>
      <Icon className="mb-3 h-5 w-5" style={{ color: palette.navy }} />
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: palette.muted }}>{label}</p>
      <p className="mt-1 text-2xl font-black" style={{ color: palette.ink }}>{value}</p>
    </div>
  );
}

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ project_id: "", project_name: "", type: "", name: "", expiry_date: "", notes: "", status: "Pendente" });
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const load = () => {
    base44.auth.me().then((me) => Promise.all([
      base44.entities.Document.filter({ created_by_id: me.id }, "-created_date"),
      base44.entities.Project.filter({ created_by_id: me.id }),
    ]).then(([d, p]) => {
      setDocs(d);
      setProjects(p.filter((proj) => proj.status !== "Arquivada"));
      setLoading(false);
    }));
  };

  useEffect(load, []);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);
    setUploading(false);
  };

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleProjectChange = (projId) => {
    const proj = projects.find((p) => p.id === projId);
    setField("project_id", projId);
    setField("project_name", proj?.name || "");
  };

  const save = async () => {
    await base44.entities.Document.create({ ...form, file_url: fileUrl });
    setOpen(false);
    setForm({ project_id: "", project_name: "", type: "", name: "", expiry_date: "", notes: "", status: "Pendente" });
    setFileUrl("");
    setFileName("");
    load();
  };

  const updateStatus = async (docId, status) => {
    await base44.entities.Document.update(docId, { status });
    load();
  };

  const filtered = docs.filter((doc) => {
    const term = search.toLowerCase();
    const matchSearch = !term || doc.type?.toLowerCase().includes(term) || doc.name?.toLowerCase().includes(term) || doc.project_name?.toLowerCase().includes(term);
    const matchProject = filterProject === "all" || doc.project_id === filterProject;
    return matchSearch && matchProject;
  });

  if (loading) return <Loading />;

  const pendingCount = docs.filter((doc) => doc.status === "Pendente" || doc.status === "Vencido").length;
  const approvedCount = docs.filter((doc) => doc.status === "Aprovado").length;
  const expiredCount = docs.filter((doc) => doc.status === "Vencido").length;

  return (
    <div className="min-h-screen" style={{ background: palette.canvas }}>
      <PageHeader title="Documentos" subtitle="Contratos, notas, certidões e arquivos vinculados às obras.">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />Enviar documento
        </Button>
      </PageHeader>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Arquivos" value={docs.length} icon={FileText} tone="#e7ebf4" />
          <Stat label="Pendentes" value={pendingCount} icon={Clock} tone="#d6ddea" />
          <Stat label="Aprovados" value={approvedCount} icon={CheckCircle2} tone="#edf2f8" />
          <Stat label="Vencidos" value={expiredCount} icon={AlertTriangle} tone="#f1f3f7" />
        </div>

        <section className="rounded-2xl border bg-white p-4" style={{ borderColor: palette.line }}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: palette.muted }} />
              <Input placeholder="Buscar por documento, obra ou tipo..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Filtrar por obra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as obras</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </section>

        {filtered.length === 0 ? (
          <section className="rounded-2xl border bg-white px-4 py-12 text-center" style={{ borderColor: palette.line }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: palette.soft }}>
              <FileText className="h-7 w-7" style={{ color: palette.navy }} />
            </div>
            <p className="font-black" style={{ color: palette.ink }}>Nenhum documento encontrado</p>
            <p className="mt-1 text-sm" style={{ color: palette.muted }}>
              {docs.length === 0 ? "Envie o primeiro documento para organizar a obra." : "Ajuste a busca ou troque o filtro de obra."}
            </p>
            {docs.length === 0 && (
              <Button onClick={() => setOpen(true)} className="mt-5">
                <Upload className="h-4 w-4" />Enviar primeiro documento
              </Button>
            )}
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: palette.line }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#eef2f8", borderBottom: `1px solid ${palette.line}` }}>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Documento</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-widest sm:table-cell" style={{ color: palette.muted }}>Obra</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-bold uppercase tracking-widest md:table-cell" style={{ color: palette.muted }}>Vencimento</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Status</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest" style={{ color: palette.muted }}>Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: palette.line }}>
                  {filtered.map((doc) => {
                    const sc = statusConfig[doc.status] || statusConfig.Pendente;
                    const Icon = sc.icon;
                    return (
                      <tr key={doc.id} className="transition-colors hover:bg-[#f6f8fc]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: palette.soft }}>
                              <FileText className="h-5 w-5" style={{ color: palette.navy }} />
                            </div>
                            <div>
                              <p className="font-black" style={{ color: palette.ink }}>{doc.name || doc.type}</p>
                              <p className="text-xs" style={{ color: palette.muted }}>{doc.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell" style={{ color: palette.text }}>{doc.project_name || doc.subcontractor_name || "Sem obra vinculada"}</td>
                        <td className="hidden px-4 py-3 md:table-cell" style={{ color: palette.text }}>{doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString("pt-BR") : "Sem vencimento"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: sc.bg, color: sc.text }}>
                            <Icon className="h-3 w-3" />{doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-center gap-1">
                            {doc.file_url && (
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="ghost" className="h-8 text-xs">
                                  <ExternalLink className="h-3 w-3" />Ver
                                </Button>
                              </a>
                            )}
                            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => updateStatus(doc.id, "Aprovado")}>Aprovar</Button>
                            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => updateStatus(doc.id, "Reprovado")}>Reprovar</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Obra *</Label>
              <Select value={form.project_id} onValueChange={handleProjectChange}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Tipo de documento *</Label>
              <Select value={form.type} onValueChange={(v) => setField("type", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Nome do documento</Label>
              <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Ex: Contrato de empreitada" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Arquivo</Label>
              <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition-colors hover:bg-[#f6f8fc]" style={{ borderColor: palette.steel }}>
                <Upload className="h-4 w-4" style={{ color: palette.navy }} />
                <span className="text-sm" style={{ color: palette.text }}>{uploading ? "Enviando arquivo..." : fileName || "Escolher arquivo"}</span>
                <input type="file" className="hidden" onChange={handleFile} disabled={uploading} />
              </label>
            </div>
            <div>
              <Label className="text-sm font-semibold">Data de vencimento</Label>
              <Input type="date" value={form.expiry_date} onChange={(e) => setField("expiry_date", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Observações</Label>
              <Input value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Observações opcionais" className="mt-1.5" />
            </div>
            <Button onClick={save} disabled={!form.project_id || !form.type || uploading} className="w-full">
              Salvar documento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, FileText, Upload, AlertTriangle, CheckCircle2, Clock, X } from "lucide-react";
import PageHeader from "../components/PageHeader";

const DOC_TYPES = ["Contrato", "Nota Fiscal", "Alvará", "ART/RRT", "Comprovante", "Certidão Negativa", "Seguro", "Documento de Equipe", "Documento de Subempreiteiro", "Outro"];

const statusConfig = {
  "Aprovado": { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  "Pendente": { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  "Vencido": { bg: "bg-red-50", text: "text-red-700", icon: AlertTriangle },
  "Reprovado": { bg: "bg-red-50", text: "text-red-700", icon: X },
};

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
    base44.auth.me().then(me => Promise.all([
      base44.entities.Document.filter({ created_by_id: me.id }, "-created_date"),
      base44.entities.Project.filter({ created_by_id: me.id }),
    ]).then(([d, p]) => {
      setDocs(d);
      setProjects(p.filter(proj => proj.status !== "Arquivada"));
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

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleProjectChange = (projId) => {
    const proj = projects.find(p => p.id === projId);
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

  const filtered = docs.filter(d => {
    const matchSearch = !search || d.type?.toLowerCase().includes(search.toLowerCase()) || d.name?.toLowerCase().includes(search.toLowerCase()) || d.project_name?.toLowerCase().includes(search.toLowerCase());
    const matchProject = filterProject === "all" || d.project_id === filterProject;
    return matchSearch && matchProject;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  const pendingCount = docs.filter(d => d.status === "Pendente" || d.status === "Vencido").length;

  return (
    <div>
      <PageHeader title="Documentos" subtitle={`${docs.length} documentos${pendingCount > 0 ? ` · ${pendingCount} pendentes` : ""}`}>
        <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-1.5" />Enviar Documento
        </Button>
      </PageHeader>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar documento..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por obra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as obras</SelectItem>
              {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-600 mb-1">Nenhum documento encontrado</p>
            <p className="text-sm text-gray-400 mb-4">
              {docs.length === 0 ? "Você ainda não enviou nenhum documento." : "Tente ajustar o filtro ou a busca."}
            </p>
            {docs.length === 0 && (
              <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-1.5" />Enviar primeiro documento
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-500">Documento</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">Obra</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden md:table-cell">Vencimento</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(d => {
                    const sc = statusConfig[d.status] || statusConfig["Pendente"];
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-800">{d.name || d.type}</p>
                              <p className="text-xs text-gray-400">{d.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{d.project_name || d.subcontractor_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                          {d.expiry_date ? new Date(d.expiry_date).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>{d.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            {d.file_url && (
                              <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600">Ver</Button>
                              </a>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-600" onClick={() => updateStatus(d.id, "Aprovado")}>Aprovar</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={() => updateStatus(d.id, "Reprovado")}>Reprovar</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Obra *</Label>
              <Select value={form.project_id} onValueChange={handleProjectChange}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Tipo de Documento *</Label>
              <Select value={form.type} onValueChange={v => setField("type", v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Nome do documento</Label>
              <Input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Ex: Contrato de empreitada" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Arquivo</Label>
              <div className="mt-1.5">
                <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {uploading ? "Enviando arquivo..." : fileName || "Escolher arquivo"}
                  </span>
                  <input type="file" className="hidden" onChange={handleFile} disabled={uploading} />
                </label>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Data de Vencimento</Label>
              <Input type="date" value={form.expiry_date} onChange={e => setField("expiry_date", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Observações</Label>
              <Input value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Observações opcionais" className="mt-1.5" />
            </div>
            <Button
              onClick={save}
              disabled={!form.project_id || !form.type || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Salvar Documento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect } from "react";
import { consuobra } from "@/api/consuobraClient";
import { Camera, FileText, Settings, Bell, Loader2, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DailyPhotoUpload from "./portal/DailyPhotoUpload";
import ReportList from "./portal/ReportList";
import PortalConfig from "./portal/PortalConfig";

export default function ProjClientPortal({ project }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [tab, setTab] = useState("upload");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [reps, me] = await Promise.all([
        consuobra.entities.DailyReport.filter({ project_id: project.id }),
        consuobra.auth.me().catch(() => null),
      ]);
      setReports(reps.sort((a, b) => (b.report_date || "").localeCompare(a.report_date || "")));
      setUser(me);
    } catch {
      setError("Não foi possível carregar o portal do cliente agora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [project.id]);

  const draftCount = reports.filter(r => r.status === "Rascunho" || r.status === "Revisado").length;
  const publishedCount = reports.filter(r => r.status === "Publicado" && r.visible_to_client !== false).length;
  const todayStr = new Date().toISOString().split("T")[0];
  const hasToday = reports.some(r => r.report_date === todayStr);

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {!hasToday && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">Nenhuma atualização enviada hoje para o cliente.</p>
        </div>
      )}
      {draftCount > 0 && (
        <div className="flex items-center gap-3 bg-secondary border border-border rounded-2xl px-4 py-3">
          <Bell className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm text-primary font-medium">{draftCount} relatório(s) aguardando revisão e publicação.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-white px-3 py-3">
          <p className="text-xl font-black text-gray-900">{reports.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Registros</p>
        </div>
        <div className="rounded-2xl border border-border bg-white px-3 py-3">
          <p className="text-xl font-black text-gray-900">{publishedCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">No portal</p>
        </div>
        <div className="rounded-2xl border border-border bg-white px-3 py-3">
          <p className="text-xl font-black text-gray-900">{hasToday ? "Sim" : "Não"}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Hoje</p>
        </div>
      </div>

      {/* Mobile quick action */}
      {!showUpload && (
        <button onClick={() => { setShowUpload(true); setTab("upload"); }} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-base shadow-lg active:scale-95 transition-transform" style={{ background: "linear-gradient(135deg, #1f3258 0%, #435b89 100%)" }}>
          <Camera className="h-5 w-5" />
          Enviar fotos do dia
        </button>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 h-auto bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="upload" className="text-xs rounded-lg py-2">
            <Camera className="h-3.5 w-3.5 mr-1" />Envio
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs rounded-lg py-2">
            <FileText className="h-3.5 w-3.5 mr-1" />Relatórios
            {draftCount > 0 && <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-white">{draftCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs rounded-lg py-2">
            <Settings className="h-3.5 w-3.5 mr-1" />Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-300" /></div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-bold text-gray-900 mb-4">Enviar fotos e atualização do dia</p>
              <DailyPhotoUpload project={project} user={user} onSaved={load} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="relatorios" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-300" /></div>
          ) : (
            <ReportList reports={reports} onUpdate={load} />
          )}
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <PortalConfig project={project} onUpdate={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

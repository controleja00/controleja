import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import ProjHeader from "../components/project/ProjHeader";
import ProjKPIs from "../components/project/ProjKPIs";
import ProjPhases from "../components/project/ProjPhases";
import ProjFinancials from "../components/project/ProjFinancials";
import ProjSubs from "../components/project/ProjSubs";
import ProjAlerts from "../components/project/ProjAlerts";
import ProjMeasurements from "../components/project/ProjMeasurements";
import ProjDocuments from "../components/project/ProjDocuments";
import ProjAIChat from "../components/project/ProjAIChat";
import ProjOverview from "../components/project/ProjOverview";
import ProjProfitCurve from "../components/project/ProjProfitCurve";
import NewMeasurementModal from "../components/project/NewMeasurementModal";
import ProjClientPortal from "../components/project/ProjClientPortal";
import EditProgressModal from "../components/project/EditProgressModal";
import EditRevenueModal from "../components/project/EditRevenueModal";

export default function ProjectDashboard() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newMeasurementOpen, setNewMeasurementOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [revenueOpen, setRevenueOpen] = useState(false);

  const handleProjectUpdated = (updatedProject) => {
    setData(prev => ({ ...prev, project: updatedProject }));
  };

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const me = await base44.auth.me();
    const project = await base44.entities.Project.get(id);

    // Verificar se o projeto pertence ao usuário logado
    if (project && project.created_by_id !== me.id) {
      setData({ project: null, accessDenied: true, subs: [], measurements: [], documents: [], alerts: [] });
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const [allSubs, allMeasurements, allDocuments, allAlerts] = await Promise.all([
      base44.entities.Subcontractor.filter({ created_by_id: me.id }),
      base44.entities.Measurement.filter({ project_id: id, created_by_id: me.id }),
      base44.entities.Document.filter({ created_by_id: me.id }),
      base44.entities.Alert.filter({ is_resolved: false, created_by_id: me.id }),
    ]);

    const subIds = project.subcontractor_ids || [];
    const subs = allSubs.filter(s => subIds.includes(s.id));
    const documents = allDocuments.filter(d => d.project_id === id || subIds.includes(d.subcontractor_id));

    setData({ project, subs, measurements: allMeasurements, documents, alerts: allAlerts });
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Carregando Central da Obra...</p>
      </div>
    </div>
  );

  if (!data?.project) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 px-4 text-center">
      <p className="text-lg font-bold text-foreground">
        {data?.accessDenied ? "Você não tem permissão para acessar esta obra." : "Obra não encontrada"}
      </p>
      <p className="text-sm text-muted-foreground">
        {data?.accessDenied ? "Esta obra pertence a outro usuário." : "Verifique se o endereço está correto."}
      </p>
      <Link to="/projects"><Button variant="outline">Voltar para Minhas Obras</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-2 flex items-center justify-between gap-2">
        <Link to="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft className="h-4 w-4" /> Obras
        </Link>
        <span className="text-xs font-bold text-primary uppercase tracking-widest truncate">Central da Obra</span>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" onClick={() => setNewMeasurementOpen(true)} className="h-8 text-xs px-2.5">
            <span className="mr-1">+</span> Medição
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <ProjHeader project={data.project} measurements={data.measurements} onEditRevenue={() => setRevenueOpen(true)} />

      <div className="px-4 py-4">
        <ProjKPIs project={data.project} measurements={data.measurements} subs={data.subs} documents={data.documents} onEditProgress={() => setProgressOpen(true)} />
      </div>

      {/* Modal elevado para fora do TabsContent — evita conflito de portal/overflow */}
      <NewMeasurementModal
        open={newMeasurementOpen}
        onOpenChange={setNewMeasurementOpen}
        project={data.project}
        onSaved={() => { setNewMeasurementOpen(false); load(true); }}
      />
      {data?.project && (
        <>
          <EditProgressModal open={progressOpen} onClose={() => setProgressOpen(false)} project={data.project} onSaved={handleProjectUpdated} />
          <EditRevenueModal open={revenueOpen} onClose={() => setRevenueOpen(false)} project={data.project} onSaved={handleProjectUpdated} />
        </>
      )}

      <div className="px-4 pb-6">
        <Tabs defaultValue="visao-geral">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-4 bg-muted/50 p-1 text-xs">
            <TabsTrigger value="visao-geral" className="text-xs">Visão Geral</TabsTrigger>
            <TabsTrigger value="lucro" className="text-xs">Lucro</TabsTrigger>
            <TabsTrigger value="operacional" className="text-xs">Fases</TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs">Financeiro</TabsTrigger>
            <TabsTrigger value="medicoes" className="text-xs">Medições</TabsTrigger>
            <TabsTrigger value="empreiteiros" className="text-xs">Empreiteiros</TabsTrigger>
            <TabsTrigger value="documentos" className="text-xs">Docs</TabsTrigger>
            <TabsTrigger value="assistente" className="text-xs">IA</TabsTrigger>
            <TabsTrigger value="portal" className="text-xs">Portal Cliente</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-0">
            <ProjOverview project={data.project} measurements={data.measurements} onProjectUpdated={handleProjectUpdated} />
          </TabsContent>

          <TabsContent value="lucro" className="mt-0">
            <ProjProfitCurve project={data.project} measurements={data.measurements} />
          </TabsContent>

          <TabsContent value="operacional" className="space-y-4 mt-0">
            <ProjPhases project={data.project} measurements={data.measurements} />
            <ProjAlerts project={data.project} subs={data.subs} measurements={data.measurements} documents={data.documents} />
          </TabsContent>

          <TabsContent value="financeiro" className="mt-0">
            <ProjFinancials project={data.project} measurements={data.measurements} />
          </TabsContent>

          <TabsContent value="medicoes" className="mt-0">
            <ProjMeasurements
              measurements={data.measurements}
              project={data.project}
              onRefresh={() => load(true)}
              modalOpen={newMeasurementOpen}
              setModalOpen={setNewMeasurementOpen}
            />
          </TabsContent>

          <TabsContent value="empreiteiros" className="mt-0">
            <ProjSubs subs={data.subs} measurements={data.measurements} documents={data.documents} />
          </TabsContent>

          <TabsContent value="documentos" className="mt-0">
            <ProjDocuments documents={data.documents} subs={data.subs} />
          </TabsContent>

          <TabsContent value="assistente" className="mt-0">
            <ProjAIChat project={data.project} subs={data.subs} measurements={data.measurements} documents={data.documents} />
          </TabsContent>

          <TabsContent value="portal" className="mt-0">
            <ProjClientPortal project={data.project} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

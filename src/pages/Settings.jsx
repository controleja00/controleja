import { useState, useEffect } from "react";
import { consuobra } from "@/api/consuobraClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/PageHeader";
import { User, Building2, Shield, CreditCard, LogOut, CheckCircle2, Download, Trash2, Loader2 } from "lucide-react";
import { CONSUOBRA_PLANS, TRIAL_DAYS, getPlanById, getUserPlanId, isPaidPlan } from "@/lib/plans";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState("");
  const [billingError, setBillingError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [privacyError, setPrivacyError] = useState("");
  const [profile, setProfile] = useState({ full_name: "", phone: "", company_name: "", cnpj: "", job_title: "" });
  const currentPlan = getPlanById(getUserPlanId(user));
  const isTrialing = user?.subscription_status === "trialing";
  const trialEnd = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const trialLabel = trialEnd && !Number.isNaN(trialEnd.getTime())
    ? `Teste grátis até ${trialEnd.toLocaleDateString("pt-BR")}`
    : `${TRIAL_DAYS} dias de teste grátis nos planos pagos`;

  useEffect(() => {
    consuobra.auth.me().then(u => {
      setUser(u);
      setProfile({
        full_name: u.full_name || "",
        phone: u.phone || "",
        company_name: u.company_name || "",
        cnpj: u.cnpj || "",
        job_title: u.job_title || "",
      });
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    await consuobra.auth.updateMe(profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const startCheckout = async (planId) => {
    setBillingError("");
    setCheckoutPlan(planId);
    try {
      const { checkoutUrl } = await consuobra.billing.createCheckout(planId);
      window.location.href = checkoutUrl;
    } catch (error) {
      setBillingError(error?.message || "Nao foi possivel abrir o checkout agora.");
      setCheckoutPlan("");
    }
  };

  const exportData = async () => {
    setPrivacyError("");
    setExporting(true);
    try {
      await consuobra.auth.exportMyData();
    } catch (error) {
      setPrivacyError(error?.message || "Não foi possível exportar seus dados agora.");
    } finally {
      setExporting(false);
    }
  };

  const deleteAccount = async () => {
    setPrivacyError("");
    setDeleting(true);
    try {
      await consuobra.auth.deleteMyAccount(deleteConfirmation);
    } catch (error) {
      setPrivacyError(error?.message || "Não foi possível excluir sua conta agora.");
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Gerencie sua conta, empresa e preferências" />
      <div className="p-4 sm:p-6 max-w-3xl">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" />Perfil</TabsTrigger>
            <TabsTrigger value="company" className="gap-1.5"><Building2 className="h-3.5 w-3.5" />Empresa</TabsTrigger>
            <TabsTrigger value="plan" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" />Plano</TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5"><Shield className="h-3.5 w-3.5" />Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="cj-form-panel space-y-4 p-6">
              <h2 className="font-semibold">Dados pessoais</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Nome completo</Label><Input value={profile.full_name} onChange={e => set("full_name", e.target.value)} /></div>
                <div><Label>E-mail</Label><Input value={user?.email || ""} disabled className="opacity-60" /></div>
                <div><Label>Telefone / WhatsApp</Label><Input value={profile.phone} onChange={e => set("phone", e.target.value)} placeholder="(11) 99999-9999" /></div>
                <div><Label>Cargo</Label><Input value={profile.job_title} onChange={e => set("job_title", e.target.value)} placeholder="Engenheiro, Diretor..." /></div>
              </div>
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                {saved ? <><CheckCircle2 className="h-4 w-4" />Salvo!</> : saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <div className="cj-form-panel space-y-4 p-6">
              <h2 className="font-semibold">Dados da empresa</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Label>Razão Social / Nome da empresa</Label><Input value={profile.company_name} onChange={e => set("company_name", e.target.value)} placeholder="Construtora Exemplo Ltda." /></div>
                <div><Label>CNPJ</Label><Input value={profile.cnpj} onChange={e => set("cnpj", e.target.value)} placeholder="00.000.000/0001-00" /></div>
              </div>
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                {saved ? <><CheckCircle2 className="h-4 w-4" />Salvo!</> : saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="plan">
            <div className="space-y-4">
              <div className="cj-form-panel p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-semibold">Plano atual</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Gerencie sua assinatura</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                    {isTrialing ? "Período de teste" : user?.subscription_status === "active" ? "Ativo" : "Gratuito"}
                  </span>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                  <p className="font-bold text-primary">{currentPlan.name} - {currentPlan.price}{currentPlan.period}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isTrialing ? trialLabel : currentPlan.desc}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => { window.location.href = "/plans"; }}>Alterar plano</Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { window.location.href = "/support"; }}>Cancelar assinatura</Button>
                </div>
              </div>
              <div className="cj-form-panel p-6">
                <h2 className="font-semibold mb-4">Comparar planos</h2>
                {billingError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{billingError}</p>}
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  {CONSUOBRA_PLANS.map(p => (
                    <div key={p.id} className={`rounded-xl p-4 border ${p.id === getUserPlanId(user) ? "border-primary bg-primary/5" : "border-border"}`}>
                      <p className="font-bold text-sm mb-0.5">{p.name}</p>
                      <p className="text-xs text-muted-foreground mb-3">{p.price}{p.period}</p>
                      {p.features.slice(0, 4).map(i => <p key={i} className="text-xs flex items-center gap-1.5 mb-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" />{i}</p>)}
                      {isPaidPlan(p.id) && p.id !== getUserPlanId(user) && (
                        <Button variant="outline" size="sm" className="mt-3 w-full" disabled={Boolean(checkoutPlan)} onClick={() => startCheckout(p.id)}>
                          {checkoutPlan === p.id ? "Abrindo checkout..." : "Assinar"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              <div className="cj-form-panel p-6">
                <h2 className="font-semibold mb-4">Segurança da conta</h2>
                <div className="space-y-3">
                  {[
                    { label: "Autenticação de dois fatores", status: "Em preparação", action: "Em breve", disabled: true },
                    { label: "Sessões ativas", status: "Gerenciadas com segurança pelo Supabase", action: "Protegido", disabled: true },
                    { label: "Histórico de atividades", status: "Alterações registradas na conta", action: "Ver histórico", to: "/audit-logs" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.status}</p></div>
                      <Button variant="outline" size="sm" disabled={item.disabled} onClick={() => item.to && (window.location.href = item.to)}>{item.action}</Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cj-form-panel p-6">
                <h2 className="font-semibold mb-1 text-destructive">Zona de risco</h2>
                <p className="text-sm text-muted-foreground mb-4">Ações irreversíveis. Proceda com cuidado.</p>
                {privacyError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{privacyError}</p>}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div><p className="text-sm font-medium">Exportar todos os dados</p><p className="text-xs text-muted-foreground">Download completo em JSON</p></div>
                    <Button variant="outline" size="sm" className="gap-1.5" disabled={exporting} onClick={exportData}>
                      {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      {exporting ? "Preparando..." : "Baixar dados"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div><p className="text-sm font-medium text-destructive">Excluir conta</p><p className="text-xs text-muted-foreground">Remove permanentemente todos os dados</p></div>
                    <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => { setPrivacyError(""); setDeleteConfirmation(""); setDeleteOpen(true); }}>
                      <Trash2 className="h-3.5 w-3.5" />Excluir conta
                    </Button>
                  </div>
                </div>
              </div>
              <div className="cj-form-panel p-6">
                <Button variant="outline" className="gap-2 text-muted-foreground" onClick={() => consuobra.auth.logout()}>
                  <LogOut className="h-4 w-4" />Sair da conta
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={deleteOpen} onOpenChange={(open) => !deleting && setDeleteOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir sua conta definitivamente?</DialogTitle>
            <DialogDescription>
              Obras, medições, documentos, fotos e demais dados serão removidos. Uma assinatura ativa será cancelada antes da exclusão. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">Digite seu e-mail para confirmar</Label>
            <Input id="delete-confirmation" type="email" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder={user?.email || "seu@email.com"} autoComplete="off" />
            <p className="text-xs text-muted-foreground">Por segurança, pode ser necessário sair e entrar novamente antes de concluir.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" disabled={deleting || deleteConfirmation.trim().toLowerCase() !== user?.email?.trim().toLowerCase()} onClick={deleteAccount}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "../components/PageHeader";
import { User, Building2, Shield, Bell, CreditCard, LogOut, CheckCircle2 } from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", phone: "", company_name: "", cnpj: "", role: "" });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setProfile({
        full_name: u.full_name || "",
        phone: u.phone || "",
        company_name: u.company_name || "",
        cnpj: u.cnpj || "",
        role: u.role || "",
      });
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    await base44.auth.updateMe(profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));

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
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold">Dados pessoais</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Nome completo</Label><Input value={profile.full_name} onChange={e => set("full_name", e.target.value)} /></div>
                <div><Label>E-mail</Label><Input value={user?.email || ""} disabled className="opacity-60" /></div>
                <div><Label>Telefone / WhatsApp</Label><Input value={profile.phone} onChange={e => set("phone", e.target.value)} placeholder="(11) 99999-9999" /></div>
                <div><Label>Cargo</Label><Input value={profile.role} onChange={e => set("role", e.target.value)} placeholder="Engenheiro, Diretor..." /></div>
              </div>
              <Button onClick={saveProfile} disabled={saving} className="gap-2">
                {saved ? <><CheckCircle2 className="h-4 w-4" />Salvo!</> : saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="company">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
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
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-semibold">Plano atual</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Gerencie sua assinatura</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Período de teste</span>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                  <p className="font-bold text-primary">Professional — 14 dias grátis</p>
                  <p className="text-sm text-muted-foreground mt-1">Acesso completo a todas as funcionalidades. Renova em R$ 997/mês após o período de teste.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">Alterar plano</Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">Cancelar assinatura</Button>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold mb-4">Comparar planos</h2>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  {[
                    { name: "Starter", price: "R$ 497/mês", items: ["3 obras", "20 empreiteiros", "Básico"] },
                    { name: "Professional", price: "R$ 997/mês", items: ["15 obras", "150 empreiteiros", "IA avançada"], active: true },
                    { name: "Enterprise", price: "Consultar", items: ["Ilimitado", "Ilimitado", "Multiempresa"] },
                  ].map(p => (
                    <div key={p.name} className={`rounded-xl p-4 border ${p.active ? "border-primary bg-primary/5" : "border-border"}`}>
                      <p className="font-bold text-sm mb-0.5">{p.name}</p>
                      <p className="text-xs text-muted-foreground mb-3">{p.price}</p>
                      {p.items.map(i => <p key={i} className="text-xs flex items-center gap-1.5 mb-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" />{i}</p>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold mb-4">Segurança da conta</h2>
                <div className="space-y-3">
                  {[
                    { label: "Autenticação de dois fatores", status: "Desativada", action: "Ativar" },
                    { label: "Sessões ativas", status: "1 dispositivo", action: "Gerenciar" },
                    { label: "Log de acessos", status: "Disponível", action: "Ver histórico" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.status}</p></div>
                      <Button variant="outline" size="sm">{item.action}</Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold mb-1 text-destructive">Zona de risco</h2>
                <p className="text-sm text-muted-foreground mb-4">Ações irreversíveis. Proceda com cuidado.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div><p className="text-sm font-medium">Exportar todos os dados</p><p className="text-xs text-muted-foreground">Download completo em JSON</p></div>
                    <Button variant="outline" size="sm">Exportar</Button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div><p className="text-sm font-medium text-destructive">Excluir conta</p><p className="text-xs text-muted-foreground">Remove permanentemente todos os dados</p></div>
                    <Button variant="destructive" size="sm">Excluir</Button>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <Button variant="outline" className="gap-2 text-muted-foreground" onClick={() => base44.auth.logout()}>
                  <LogOut className="h-4 w-4" />Sair da conta
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
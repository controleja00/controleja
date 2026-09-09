import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Copy, Link2, RefreshCw, Shield, Eye, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const genToken = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

export default function PortalConfig({ project, onUpdate }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const all = await base44.entities.ClientPortalConfig.filter({ project_id: project.id });
    setConfig(all[0] || null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [project.id]);

  const save = async (patch) => {
    setSaving(true);
    if (config?.id) {
      const updated = await base44.entities.ClientPortalConfig.update(config.id, patch);
      setConfig(updated);
    } else {
      const token = patch.access_token || genToken();
      const created = await base44.entities.ClientPortalConfig.create({ project_id: project.id, access_token: token, ...patch });
      setConfig(created);
    }
    setSaving(false);
    onUpdate?.();
  };

  const toggle = (field) => save({ ...(config || {}), [field]: !config?.[field] });

  const portalUrl = config?.access_token
    ? `${window.location.origin}/portal/${config.access_token}`
    : null;

  const copy = () => {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revoke = () => save({ access_token: genToken(), active: false });
  const generate = () => save({ active: true, access_token: config?.access_token || genToken() });

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-gray-300" /></div>;

  const toggleStyle = (on) => `h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "bg-blue-600" : "bg-gray-200"}`;
  const thumb = (on) => `h-4 w-4 bg-white rounded-full shadow transition-all mx-1 ${on ? "translate-x-5" : "translate-x-0"}`;

  const SwitchRow = ({ label, sub, field }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <button onClick={() => toggle(field)} className={toggleStyle(config?.[field])}>
        <div className={thumb(config?.[field])} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Status + link */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${config?.active ? "bg-emerald-500" : "bg-gray-300"}`} />
            <p className="font-bold text-gray-900">Portal do Cliente</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config?.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            {config?.active ? "Ativo" : "Inativo"}
          </span>
        </div>

        {portalUrl && config?.active ? (
          <div className="bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5 flex items-center gap-2 mb-4">
            <Link2 className="h-4 w-4 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-600 truncate flex-1 font-mono">{portalUrl}</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-4">Ative o portal para gerar um link seguro de acesso para o cliente.</p>
        )}

        <div className="flex gap-2 flex-wrap">
          {!config?.active ? (
            <Button onClick={generate} disabled={saving} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Ativar Portal
            </Button>
          ) : (
            <>
              <Button onClick={copy} variant="outline" className="gap-1.5 text-sm">
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar Link"}
              </Button>
              <Button onClick={revoke} variant="outline" disabled={saving} className="gap-1.5 text-sm text-red-500 border-red-200 hover:bg-red-50">
                <RefreshCw className="h-3.5 w-3.5" />Revogar Link
              </Button>
              <Button onClick={() => save({ active: false })} variant="ghost" disabled={saving} className="text-sm text-gray-400">
                Desativar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Visibility settings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="h-4 w-4 text-gray-400" />
          <p className="font-bold text-gray-900">O que o cliente pode ver</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">O cliente nunca verá dados financeiros internos, subempreiteiros ou documentos internos.</p>
        <SwitchRow label="Fotos diárias" sub="Fotos marcadas como visíveis" field="show_photos" />
        <SwitchRow label="Relatórios" sub="Apenas relatórios publicados" field="show_reports" />
        <SwitchRow label="Percentual concluído" sub="Progresso físico da obra" field="show_progress" />
        <SwitchRow label="Próximos passos" sub="Etapas futuras previstas" field="show_next_steps" />
        <SwitchRow label="Previsão de entrega" sub="Data prevista de conclusão" field="show_deadline" />
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 bg-blue-50 rounded-2xl border border-blue-100 p-4">
        <Shield className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Link seguro por token único</p>
          <p className="text-xs text-blue-600 mt-0.5">O cliente acessa apenas esta obra. Ao revogar, o link antigo deixa de funcionar imediatamente.</p>
        </div>
      </div>
    </div>
  );
}
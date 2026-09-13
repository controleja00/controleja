import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BrandLogo from '@/components/BrandLogo';
import { CONTACT_EMAILS, CONTACT_LINKS } from '@/lib/contact';

export default function UserNotRegisteredError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4" style={{ background: "#f6f8fc" }}>
      <div className="max-w-sm w-full">
        <BrandLogo size="lg" className="justify-center mb-8" />

        <div className="rounded-2xl p-7 shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid #e1e5ed" }}>
          <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-5" style={{ background: "#FEF3C7" }}>
            <svg className="w-7 h-7" style={{ color: "#D97706" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-center mb-2" style={{ color: "#172441" }}>Acesso restrito</h1>
          <p className="text-sm text-center mb-6" style={{ color: "#424c62" }}>
            Sua conta não está autorizada a usar o Consuobra. Entre em contato com o administrador para solicitar acesso.
          </p>
          <div className="rounded-xl p-4 mb-5 text-sm" style={{ background: "#f6f8fc", border: "1.5px solid #e1e5ed" }}>
            <p className="font-semibold mb-2" style={{ color: "#172441" }}>O que você pode fazer:</p>
            <ul className="space-y-1.5" style={{ color: "#424c62" }}>
              <li className="flex items-start gap-2"><span className="shrink-0">•</span>Verifique se entrou com o e-mail correto</li>
              <li className="flex items-start gap-2"><span className="shrink-0">•</span>Solicite acesso ao administrador</li>
              <li className="flex items-start gap-2"><span className="shrink-0">•</span>Entre em contato: <a href={CONTACT_LINKS.supportEmail} className="font-medium underline" style={{ color: "#1f3258" }}>{CONTACT_EMAILS.support}</a></li>
            </ul>
          </div>
          <button onClick={() => base44.auth.logout("/")} className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ border: "1.5px solid #e1e5ed", color: "#424c62", background: "#FFFFFF" }}>
            <LogOut className="h-4 w-4" />Sair e tentar com outra conta
          </button>
        </div>
      </div>
    </div>
  );
}

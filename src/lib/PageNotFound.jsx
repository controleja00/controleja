import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Building2, Home, LayoutDashboard, LogIn } from 'lucide-react';

export default function PageNotFound() {
  const { data, isFetched } = useQuery({
    queryKey: ['auth-check-404'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { isAuthenticated: true, user };
      } catch {
        return { isAuthenticated: false, user: null };
      }
    },
    retry: false,
    staleTime: 30000,
  });

  const isAuth = isFetched && data?.isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#F4F6FA" }}>
      <div className="text-center max-w-sm w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "#1B2F55" }}>
            <Building2 className="h-5 w-5 text-[#D7D9DE]" />
          </div>
          <div className="leading-none text-left">
            <p className="font-black text-lg tracking-tight" style={{ color: "#1B2F55" }}>ControleJá</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "#A8ABB3" }}>Grupo Busk</p>
          </div>
        </Link>

        <div className="rounded-2xl p-8 shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid #D7D9DE" }}>
          <p className="text-7xl font-black mb-3" style={{ color: "#D7D9DE" }}>404</p>
          <h1 className="text-2xl font-black mb-2" style={{ color: "#101828" }}>Página não encontrada</h1>
          <p className="text-sm mb-8" style={{ color: "#667085" }}>
            A página que você tentou acessar não existe ou foi movida.
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/" className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-colors" style={{ background: "#1B2F55" }}>
              <Home className="h-4 w-4" />
              Voltar para o início
            </Link>

            {isAuth ? (
              <Link to="/dashboard" className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ border: "1.5px solid #D7D9DE", color: "#1B2F55", background: "#FFFFFF" }}>
                <LayoutDashboard className="h-4 w-4" />
                Ir para o dashboard
              </Link>
            ) : (
              <Link to="/login" className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ border: "1.5px solid #D7D9DE", color: "#1B2F55", background: "#FFFFFF" }}>
                <LogIn className="h-4 w-4" />
                Entrar na minha conta
              </Link>
            )}
          </div>
        </div>

        <p className="text-xs mt-5" style={{ color: "#A8ABB3" }}>
          Precisa de ajuda?{" "}
          <Link to="/support" className="underline hover:text-gray-600" style={{ color: "#667085" }}>Fale com o suporte</Link>
        </p>
      </div>
    </div>
  );
}
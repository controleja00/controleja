import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Home, LayoutDashboard, LogIn } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#F3F6F2" }}>
      <div className="text-center max-w-sm w-full">
        <BrandLogo size="lg" className="justify-center mb-10" />

        <div className="rounded-2xl p-8 shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid #DCE6E1" }}>
          <p className="text-7xl font-black mb-3" style={{ color: "#DCE6E1" }}>404</p>
          <h1 className="text-2xl font-black mb-2" style={{ color: "#111917" }}>Página não encontrada</h1>
          <p className="text-sm mb-8" style={{ color: "#52615B" }}>
            A página que você tentou acessar não existe ou foi movida.
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/" className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-colors" style={{ background: "#123C34" }}>
              <Home className="h-4 w-4" />
              Voltar para o início
            </Link>

            {isAuth ? (
              <Link to="/dashboard" className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ border: "1.5px solid #DCE6E1", color: "#123C34", background: "#FFFFFF" }}>
                <LayoutDashboard className="h-4 w-4" />
                Ir para o dashboard
              </Link>
            ) : (
              <Link to="/login" className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ border: "1.5px solid #DCE6E1", color: "#123C34", background: "#FFFFFF" }}>
                <LogIn className="h-4 w-4" />
                Entrar na minha conta
              </Link>
            )}
          </div>
        </div>

        <p className="text-xs mt-5" style={{ color: "#81928B" }}>
          Precisa de ajuda?{" "}
          <Link to="/support" className="underline hover:text-gray-600" style={{ color: "#52615B" }}>Fale com o suporte</Link>
        </p>
      </div>
    </div>
  );
}

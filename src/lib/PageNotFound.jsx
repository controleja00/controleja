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
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#fbfaf8" }}>
      <div className="text-center max-w-sm w-full">
        <BrandLogo size="lg" className="justify-center mb-10" />

        <div className="rounded-2xl p-8 shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid #efefef" }}>
          <p className="text-7xl font-black mb-3" style={{ color: "#efefef" }}>404</p>
          <h1 className="text-2xl font-black mb-2" style={{ color: "#111917" }}>Página não encontrada</h1>
          <p className="text-sm mb-8" style={{ color: "#3d3e45" }}>
            A página que você tentou acessar não existe ou foi movida.
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/" className="w-full h-11 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-colors" style={{ background: "#004038" }}>
              <Home className="h-4 w-4" />
              Voltar para o início
            </Link>

            {isAuth ? (
              <Link to="/dashboard" className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ border: "1.5px solid #efefef", color: "#004038", background: "#FFFFFF" }}>
                <LayoutDashboard className="h-4 w-4" />
                Ir para o dashboard
              </Link>
            ) : (
              <Link to="/login" className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ border: "1.5px solid #efefef", color: "#004038", background: "#FFFFFF" }}>
                <LogIn className="h-4 w-4" />
                Entrar na minha conta
              </Link>
            )}
          </div>
        </div>

        <p className="text-xs mt-5" style={{ color: "#6f7073" }}>
          Precisa de ajuda?{" "}
          <Link to="/support" className="underline hover:text-gray-600" style={{ color: "#3d3e45" }}>Fale com o suporte</Link>
        </p>
      </div>
    </div>
  );
}

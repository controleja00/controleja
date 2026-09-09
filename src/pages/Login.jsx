import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { document.title = "Entrar | Consuobra"; }, []);

  const redirect = () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    window.location.href = (next && next.startsWith("/") && !next.startsWith("//")) ? next : "/dashboard";
  };

  const getSafeNext = () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    return (next && next.startsWith("/") && !next.startsWith("//")) ? next : "/dashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setError(""); setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      redirect();
    } catch {
      setError("E-mail ou senha incorretos. Tente novamente.");
    } finally { setLoading(false); }
  };

  const inputBase = "w-full h-10 rounded-xl px-3 text-sm outline-none transition-all";
  const inputStyle = { border: "1.5px solid #efefef", background: "#fbfaf8", color: "#111917" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: "#fbfaf8" }}>
      <div className="w-full max-w-sm">
        <BrandLogo size="lg" className="justify-center mb-8" />

        <div className="rounded-2xl p-7 shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid #efefef" }}>
          <h1 className="text-2xl font-black mb-1" style={{ color: "#111917" }}>Bem-vindo de volta</h1>
          <p className="text-sm mb-6" style={{ color: "#3d3e45" }}>Entre para continuar no Consuobra</p>

          {error && (
            <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111917" }}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email"
                className={inputBase} style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#004038"} onBlur={e => e.target.style.borderColor = "#efefef"} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold" style={{ color: "#111917" }}>Senha</label>
                <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: "#006b5f" }}>Esqueci minha senha</Link>
              </div>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" autoComplete="current-password"
                  className={`${inputBase} pr-10`} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#004038"} onBlur={e => e.target.style.borderColor = "#efefef"} />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#6f7073" }}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-bold text-base text-white transition-opacity disabled:opacity-60" style={{ background: "#004038" }}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "#efefef" }} />
            <span className="text-xs" style={{ color: "#6f7073" }}>ou</span>
            <div className="flex-1 h-px" style={{ background: "#efefef" }} />
          </div>

          <button type="button" onClick={() => base44.auth.loginWithProvider("google", getSafeNext())}
            className="w-full h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
            style={{ border: "1.5px solid #efefef", background: "#FFFFFF", color: "#111917" }}>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          <p className="text-center text-sm mt-5" style={{ color: "#3d3e45" }}>
            Não tem conta?{" "}
            <Link to="/register" className="font-bold hover:underline" style={{ color: "#004038" }}>Criar conta grátis</Link>
          </p>
        </div>

        <p className="text-center text-[11px] mt-4" style={{ color: "#6f7073" }}>
          Ao entrar, você concorda com os{" "}
          <Link to="/terms" className="underline hover:text-gray-500">Termos de Uso</Link> e a{" "}
          <Link to="/privacy" className="underline hover:text-gray-500">Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}

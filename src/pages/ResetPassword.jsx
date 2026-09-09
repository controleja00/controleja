import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => { document.title = "Redefinir senha | Consuobra"; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (password !== confirm) { setError("As senhas não coincidem. Verifique e tente novamente."); return; }
    if (password.length < 8) { setError("A senha deve ter no mínimo 8 caracteres."); return; }
    if (!resetToken) { setError("Link inválido. Solicite um novo link de redefinição."); return; }
    setLoading(true);
    try { await base44.auth.resetPassword({ resetToken, newPassword: password }); setDone(true); }
    catch { setError("Link inválido ou expirado. Solicite um novo link de redefinição de senha."); }
    finally { setLoading(false); }
  };

  const inputStyle = { border: "1.5px solid #efefef", background: "#fbfaf8", color: "#111917" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: "#fbfaf8" }}>
      <div className="w-full max-w-sm">
        <BrandLogo size="lg" className="justify-center mb-8" />
        <div className="rounded-2xl p-7" style={{ background: "#FFFFFF", border: "1.5px solid #efefef" }}>
          {done ? (
            <div className="text-center py-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#bee9f4" }}>
                <CheckCircle2 className="h-7 w-7" style={{ color: "#004038" }} />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: "#111917" }}>Senha redefinida!</h2>
              <p className="text-sm mb-6" style={{ color: "#3d3e45" }}>Sua senha foi alterada com sucesso. Você já pode entrar com a nova senha.</p>
              <Link to="/login">
                <button className="w-full h-11 rounded-lg font-bold text-white" style={{ background: "#004038" }}>Ir para o login</button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black mb-1" style={{ color: "#111917" }}>Redefinir senha</h1>
              <p className="text-sm mb-6" style={{ color: "#3d3e45" }}>Escolha uma nova senha segura para sua conta.</p>
              {!resetToken && (
                <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
                  Link inválido. <Link to="/forgot-password" className="font-bold underline">Solicite um novo link.</Link>
                </div>
              )}
              {error && <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111917" }}>Nova senha</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres"
                      className="w-full h-10 rounded-xl px-3 pr-10 text-sm outline-none" style={inputStyle} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#6f7073" }}>
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111917" }}>Confirmar nova senha</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a nova senha"
                    className="w-full h-10 rounded-xl px-3 text-sm outline-none" style={inputStyle} />
                </div>
                <button type="submit" disabled={loading || !password || !confirm || !resetToken} className="w-full h-11 rounded-lg font-bold text-base text-white disabled:opacity-60" style={{ background: "#004038" }}>
                  {loading ? "Salvando..." : "Redefinir senha"}
                </button>
              </form>
              <Link to="/forgot-password" className="text-xs hover:underline flex items-center justify-center mt-4" style={{ color: "#6f7073" }}>
                Solicitar novo link
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

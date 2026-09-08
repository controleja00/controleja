import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, Eye, EyeOff } from "lucide-react";

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
    if (password.length < 6) { setError("A senha deve ter no mínimo 6 caracteres."); return; }
    if (!resetToken) { setError("Link inválido. Solicite um novo link de redefinição."); return; }
    setLoading(true);
    try { await base44.auth.resetPassword({ resetToken, newPassword: password }); setDone(true); }
    catch { setError("Link inválido ou expirado. Solicite um novo link de redefinição de senha."); }
    finally { setLoading(false); }
  };

  const inputStyle = { border: "1.5px solid #DCE6E1", background: "#F3F6F2", color: "#111917" };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: "#F3F6F2" }}>
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #123C34 0%, #1F6F61 100%)" }}>
            <Building2 className="h-5 w-5 text-[#DCE6E1]" />
          </div>
          <div className="leading-none">
            <p className="font-black text-xl tracking-tight" style={{ color: "#123C34" }}>Consuobra</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#81928B" }}>Obra sob controle</p>
          </div>
        </Link>
        <div className="rounded-2xl p-7 shadow-sm" style={{ background: "#FFFFFF", border: "1.5px solid #DCE6E1" }}>
          {done ? (
            <div className="text-center py-4">
              <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#ECFDF5" }}>
                <svg className="h-7 w-7" style={{ color: "#16A34A" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: "#111917" }}>Senha redefinida!</h2>
              <p className="text-sm mb-6" style={{ color: "#52615B" }}>Sua senha foi alterada com sucesso. Você já pode entrar com a nova senha.</p>
              <Link to="/login">
                <button className="w-full h-11 rounded-xl font-bold text-white" style={{ background: "#123C34" }}>Ir para o login</button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black mb-1" style={{ color: "#111917" }}>Redefinir senha</h1>
              <p className="text-sm mb-6" style={{ color: "#52615B" }}>Escolha uma nova senha segura para sua conta.</p>
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
                    <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                      className="w-full h-10 rounded-xl px-3 pr-10 text-sm outline-none" style={inputStyle} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#81928B" }}>
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111917" }}>Confirmar nova senha</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a nova senha"
                    className="w-full h-10 rounded-xl px-3 text-sm outline-none" style={inputStyle} />
                </div>
                <button type="submit" disabled={loading || !password || !confirm || !resetToken} className="w-full h-11 rounded-xl font-bold text-base text-white disabled:opacity-60" style={{ background: "#123C34" }}>
                  {loading ? "Salvando..." : "Redefinir senha"}
                </button>
              </form>
              <Link to="/forgot-password" className="text-xs hover:underline flex items-center justify-center mt-4" style={{ color: "#81928B" }}>
                Solicitar novo link
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
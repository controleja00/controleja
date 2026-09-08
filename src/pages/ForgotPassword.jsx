import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => { document.title = "Recuperar senha | Consuobra"; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await base44.auth.resetPasswordRequest(email); } catch {}
    setLoading(false); setSent(true);
  };

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
          {sent ? (
            <div className="text-center py-4">
              <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#ECFDF5" }}>
                <svg className="h-7 w-7" style={{ color: "#16A34A" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: "#111917" }}>Verifique seu e-mail</h2>
              <p className="text-sm mb-2" style={{ color: "#52615B" }}>Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.</p>
              <p className="text-xs mb-6" style={{ color: "#81928B" }}>Verifique também a pasta de spam.</p>
              <Link to="/login" className="text-sm font-semibold hover:underline flex items-center justify-center gap-1" style={{ color: "#123C34" }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black mb-1" style={{ color: "#111917" }}>Esqueci minha senha</h1>
              <p className="text-sm mb-6" style={{ color: "#52615B" }}>Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111917" }}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" required
                    className="w-full h-10 rounded-xl px-3 text-sm outline-none" style={{ border: "1.5px solid #DCE6E1", background: "#F3F6F2", color: "#111917" }} />
                </div>
                <button type="submit" disabled={loading || !email} className="w-full h-11 rounded-xl font-bold text-base text-white disabled:opacity-60" style={{ background: "#123C34" }}>
                  {loading ? "Enviando..." : "Enviar link de redefinição"}
                </button>
              </form>
              <Link to="/login" className="text-sm font-medium hover:underline flex items-center justify-center gap-1 mt-5" style={{ color: "#52615B" }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
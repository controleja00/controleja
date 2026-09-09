import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, MailCheck } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: "#fbfaf8" }}>
      <div className="w-full max-w-sm">
        <BrandLogo size="lg" className="justify-center mb-8" />
        <div className="rounded-2xl p-7" style={{ background: "#FFFFFF", border: "1.5px solid #efefef" }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#bee9f4" }}>
                <MailCheck className="h-7 w-7" style={{ color: "#004038" }} />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: "#111917" }}>Verifique seu e-mail</h2>
              <p className="text-sm mb-2" style={{ color: "#3d3e45" }}>Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.</p>
              <p className="text-xs mb-6" style={{ color: "#6f7073" }}>Verifique também a pasta de spam.</p>
              <Link to="/login" className="text-sm font-semibold hover:underline flex items-center justify-center gap-1" style={{ color: "#004038" }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black mb-1" style={{ color: "#111917" }}>Esqueci minha senha</h1>
              <p className="text-sm mb-6" style={{ color: "#3d3e45" }}>Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#111917" }}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" required
                    className="w-full h-10 rounded-xl px-3 text-sm outline-none" style={{ border: "1.5px solid #efefef", background: "#fbfaf8", color: "#111917" }} />
                </div>
                <button type="submit" disabled={loading || !email} className="w-full h-11 rounded-lg font-bold text-base text-white disabled:opacity-60" style={{ background: "#004038" }}>
                  {loading ? "Enviando..." : "Enviar link de redefinição"}
                </button>
              </form>
              <Link to="/login" className="text-sm font-medium hover:underline flex items-center justify-center gap-1 mt-5" style={{ color: "#3d3e45" }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

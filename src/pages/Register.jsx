import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { redirectToGoogleAuth } from "@/lib/googleAuthRedirect";
import { ACTIVE_PLAN_ID, getPlanById, getTrialEndDate, isPaidPlan } from "@/lib/plans";

const Logo = () => (
  <BrandLogo size="lg" className="justify-center mb-8" />
);

export default function Register() {
  const selectedPlanId = new URLSearchParams(window.location.search).get("plan") || ACTIVE_PLAN_ID;
  const selectedPlan = getPlanById(selectedPlanId);
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  useEffect(() => { document.title = "Criar conta | Consuobra"; }, []);

  const inputStyle = { border: "1.5px solid #e1e5ed", background: "#f6f8fc", color: "#172441" };
  const inputClass = "w-full h-10 rounded-xl px-3 text-sm outline-none transition-all";

  const handleRegister = async (e) => {
    e.preventDefault(); setError("");
    if (!email || !password) { setError("Preencha todos os campos obrigatórios."); return; }
    if (password !== confirm) { setError("As senhas não coincidem. Verifique e tente novamente."); return; }
    if (password.length < 8) { setError("A senha deve ter no mínimo 8 caracteres."); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      const message = err?.message || "";
      if (message.includes("already")) {
        setError("Este e-mail já está cadastrado. Tente entrar.");
      } else if (message.toLowerCase().includes("password")) {
        setError("A senha deve ter no mínimo 8 caracteres.");
      } else if (message.toLowerCase().includes("app not found")) {
        setError("Não foi possível conectar ao cadastro agora. Atualize a página e tente novamente.");
      } else {
        setError(message || "Erro ao criar conta. Tente novamente.");
      }
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setError("");
    if (!otp || otp.length < 4) { setError("Digite o código completo recebido por e-mail."); return; }
    setLoading(true);
    try {
      const res = await base44.auth.verifyOtp({ email, otpCode: otp });
      base44.auth.setToken(res.access_token);
      await base44.auth.updateMe({
        plan_id: selectedPlan.id,
        subscription_status: isPaidPlan(selectedPlan.id) ? "trialing" : "free",
        trial_ends_at: isPaidPlan(selectedPlan.id) ? getTrialEndDate() : null,
      }).catch(() => {});
      window.location.href = "/onboarding";
    } catch {
      setError("Código inválido ou expirado. Verifique o e-mail ou solicite um novo código abaixo.");
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try { await base44.auth.resendOtp(email); } catch {}
    setResent(true); setError("");
    setTimeout(() => setResent(false), 6000);
  };

  const handleGoogleRegister = () => {
    setError("");
    try {
      redirectToGoogleAuth("/onboarding");
    } catch (err) {
      setError(err?.message || "Não foi possível iniciar o cadastro pelo Google. Tente novamente ou crie a conta usando e-mail e senha.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: "#f6f8fc" }}>
      <div className="w-full max-w-sm">
        <Logo />
        <div className="rounded-2xl p-7" style={{ background: "#FFFFFF", border: "1.5px solid #e1e5ed" }}>
          {step === "form" ? (
            <>
              <h1 className="text-2xl font-black mb-1" style={{ color: "#172441" }}>Crie sua conta</h1>
              <p className="text-sm mb-6" style={{ color: "#424c62" }}>
                {isPaidPlan(selectedPlan.id)
                  ? `${selectedPlan.name}: ${selectedPlan.price}/mês após 7 dias grátis`
                  : "Grátis para começar, sem cartão de crédito"}
              </p>

              {error && <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>{error}</div>}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#172441" }}>E-mail *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" required className={inputClass} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#172441" }}>Senha * <span className="font-normal text-xs" style={{ color: "#778096" }}>(mínimo 8 caracteres)</span></label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required className={`${inputClass} pr-10`} style={inputStyle} />
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#778096" }}>
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#172441" }}>Confirmar senha *</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha" required className={inputClass} style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-bold text-base text-white transition-opacity disabled:opacity-60" style={{ background: "#1f3258" }}>
                  {loading ? "Criando conta..." : "Criar conta grátis"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: "#e1e5ed" }} />
                <span className="text-xs" style={{ color: "#778096" }}>ou</span>
                <div className="flex-1 h-px" style={{ background: "#e1e5ed" }} />
              </div>

              <button type="button" onClick={handleGoogleRegister} className="w-full h-11 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors hover:bg-[#f6f8fc]" style={{ border: "1.5px solid #e1e5ed", background: "#FFFFFF", color: "#172441" }}>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              <p className="text-center text-sm mt-5" style={{ color: "#424c62" }}>
                Já tem conta? <Link to="/login" className="font-bold hover:underline" style={{ color: "#1f3258" }}>Entrar</Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#EFF6FF" }}>
                  <svg className="h-6 w-6" style={{ color: "#1f3258" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-black mb-1" style={{ color: "#172441" }}>Confirme seu e-mail</h1>
                <p className="text-sm" style={{ color: "#424c62" }}>Enviamos um código de verificação para</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: "#172441" }}>{email}</p>
              </div>

              {error && <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>{error}</div>}
              {resent && <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#16A34A" }}>✓ Código reenviado! Verifique sua caixa de entrada.</div>}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#172441" }}>Código de verificação</label>
                  <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} inputMode="numeric"
                    className="w-full h-14 rounded-xl px-3 text-center text-2xl tracking-[0.5em] font-bold outline-none transition-all"
                    style={{ border: "1.5px solid #e1e5ed", background: "#f6f8fc", color: "#1f3258" }} />
                </div>
                <button type="submit" disabled={loading || otp.length < 4} className="w-full h-11 rounded-xl font-bold text-base text-white disabled:opacity-60" style={{ background: "#1f3258" }}>
                  {loading ? "Verificando..." : "Confirmar e entrar"}
                </button>
              </form>

              <p className="text-center text-sm mt-4" style={{ color: "#424c62" }}>
                Não recebeu o código?{" "}
                <button onClick={handleResend} className="font-bold hover:underline" style={{ color: "#1f3258" }}>Reenviar</button>
              </p>
              <p className="text-center mt-3">
                <button onClick={() => { setStep("form"); setError(""); setOtp(""); }} className="text-xs hover:underline" style={{ color: "#778096" }}>Voltar e editar e-mail</button>
              </p>
              <div className="mt-4 rounded-xl p-3 text-xs text-center" style={{ background: "#f6f8fc", color: "#778096" }}>
                Verifique também a pasta de spam. O código expira em 15 minutos.
              </div>
            </>
          )}
        </div>
        <p className="text-center text-[11px] mt-4" style={{ color: "#778096" }}>
          Ao criar conta, você concorda com os{" "}
          <Link to="/terms" className="underline hover:text-gray-500">Termos de Uso</Link> e a{" "}
          <Link to="/privacy" className="underline hover:text-gray-500">Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}

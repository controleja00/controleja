import { createClient } from "@supabase/supabase-js";
import { badRequest, methodNotAllowed, requireEnv, serverError } from "../_http.js";
import { BILLING_PLANS, buildCheckoutPayload } from "./_asaas.js";

const getBearerToken = (req) => {
  const header = String(req.headers.authorization || "");
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
};

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  const planId = String(req.body?.planId || "").toLowerCase();
  if (!BILLING_PLANS[planId]) return badRequest(res, "Plano invalido.");

  try {
    const supabaseUrl = requireEnv("VITE_SUPABASE_URL");
    const publishableKey = requireEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Faca login para assinar um plano." });

    const authClient = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData.user) return res.status(401).json({ error: "Sessao invalida ou expirada." });

    const admin = createClient(supabaseUrl, requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("trial_ends_at")
      .eq("id", authData.user.id)
      .single();
    if (profileError) throw profileError;

    const now = new Date();
    const savedTrialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const firstDueDate = savedTrialEnd && savedTrialEnd > now
      ? savedTrialEnd
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const origin = String(process.env.PUBLIC_APP_URL || "https://consuobra.com.br").replace(/\/$/, "");
    const checkoutPayload = buildCheckoutPayload({
      userId: authData.user.id,
      planId,
      origin,
      firstDueDate,
    });

    const apiUrl = String(process.env.ASAAS_API_URL || "https://api.asaas.com/v3").replace(/\/$/, "");
    const response = await fetch(`${apiUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: requireEnv("ASAAS_API_KEY"),
        "User-Agent": "Consuobra/1.0",
      },
      body: JSON.stringify(checkoutPayload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.id) {
      console.error("Asaas checkout error", response.status, result);
      return res.status(502).json({ error: "O checkout esta temporariamente indisponivel." });
    }

    const checkoutHost = apiUrl.includes("sandbox") ? "https://sandbox.asaas.com" : "https://asaas.com";
    return res.status(200).json({
      checkoutUrl: `${checkoutHost}/checkoutSession/show?id=${encodeURIComponent(result.id)}`,
    });
  } catch (error) {
    return serverError(res, error, "Nao foi possivel iniciar o checkout agora.");
  }
}


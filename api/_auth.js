import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./_http.js";

export const getBearerToken = (req) => {
  const header = String(req.headers.authorization || "");
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
};

export const authenticateRequest = async (req) => {
  const token = getBearerToken(req);
  if (!token) return { error: "Faca login para continuar." };

  const url = requireEnv("VITE_SUPABASE_URL");
  const auth = createClient(url, requireEnv("VITE_SUPABASE_PUBLISHABLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) return { error: "Sessao invalida ou expirada." };

  const admin = createClient(url, requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { user: data.user, admin };
};

import { appParams } from "@/lib/app-params";

const GOOGLE_AUTH_TEMP_DOMAIN_MESSAGE =
  "O login com Google precisa de um dominio proprio conectado ao Base44. Por enquanto, use e-mail e senha ou publique em um dominio como app.consuobra.com.br.";

export function getGoogleAuthUnavailableReason() {
  if (typeof window === "undefined") return "";
  const hostname = window.location.hostname.toLowerCase();
  return hostname.endsWith(".vercel.app") ? GOOGLE_AUTH_TEMP_DOMAIN_MESSAGE : "";
}

export function redirectToGoogleAuth(fromPath = "/dashboard") {
  if (!appParams.appId || !appParams.appBaseUrl) {
    throw new Error("Base44 auth settings are missing.");
  }

  const unavailableReason = getGoogleAuthUnavailableReason();
  if (unavailableReason) {
    throw new Error(unavailableReason);
  }

  const redirectUrl = new URL(fromPath, window.location.origin).toString();
  const loginUrl = `${appParams.appBaseUrl}/api/apps/auth/login?app_id=${encodeURIComponent(appParams.appId)}&from_url=${encodeURIComponent(redirectUrl)}`;

  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = loginUrl;
      return;
    }
  } catch {
    // Cross-origin frames can block top navigation; fall back to the current page.
  }

  window.location.assign(loginUrl);
}

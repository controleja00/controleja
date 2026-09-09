import { appParams } from "@/lib/app-params";

export function redirectToGoogleAuth(fromPath = "/dashboard") {
  if (!appParams.appId || !appParams.appBaseUrl) {
    throw new Error("Base44 auth settings are missing.");
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

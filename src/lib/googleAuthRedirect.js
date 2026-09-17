import { consuobra } from "@/api/consuobraClient";

export const isGoogleAuthEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true";

export function getGoogleAuthUnavailableReason() {
  return isGoogleAuthEnabled
    ? ""
    : "Login pelo Google ainda nao configurado. Entre com e-mail e senha.";
}

export function redirectToGoogleAuth(fromPath = "/dashboard") {
  const reason = getGoogleAuthUnavailableReason();
  if (reason) throw new Error(reason);
  return consuobra.auth.loginWithGoogle(fromPath);
}

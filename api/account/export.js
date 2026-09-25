import { authenticateRequest } from "../_auth.js";
import { methodNotAllowed, serverError } from "../_http.js";
import { ACCOUNT_TABLES, listUserFiles } from "./_account.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  try {
    const { user, admin, error } = await authenticateRequest(req);
    if (error) return res.status(401).json({ error });

    const { data: profile, error: profileError } = await admin.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (profileError) throw profileError;
    const records = {};
    for (const table of ACCOUNT_TABLES) {
      const { data, error: tableError } = await admin.from(table).select("*").eq("created_by_id", user.id);
      if (tableError) throw tableError;
      records[table] = data || [];
    }
    const { data: subscriptions, error: subscriptionError } = await admin.from("subscriptions").select("*").eq("user_id", user.id);
    if (subscriptionError) throw subscriptionError;
    const { data: consents, error: consentError } = await admin.from("privacy_consents").select("*").eq("user_id", user.id);
    if (consentError) throw consentError;

    const storage = {};
    for (const bucket of ["app-files", "private-files"]) {
      storage[bucket] = await listUserFiles(admin.storage, bucket, user.id);
    }
    const payload = {
      export_version: "1.0",
      generated_at: new Date().toISOString(),
      account: { id: user.id, email: user.email, created_at: user.created_at, profile },
      subscriptions,
      privacy_consents: consents,
      records,
      storage,
    };
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="consuobra-dados-${stamp}.json"`);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(JSON.stringify(payload, null, 2));
  } catch (error) {
    return serverError(res, error, "Nao foi possivel exportar seus dados agora.");
  }
}

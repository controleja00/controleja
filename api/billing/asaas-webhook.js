import { createClient } from "@supabase/supabase-js";
import { methodNotAllowed, requireEnv, serverError } from "../_http.js";
import {
  getBillingReference,
  getProviderSubscriptionId,
  getSubscriptionStatus,
  parseBillingReference,
  safeTokenEqual,
} from "./_asaas.js";

const getAdminClient = () => createClient(
  requireEnv("VITE_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  let admin;
  let eventId = "";
  try {
    const expectedToken = requireEnv("ASAAS_WEBHOOK_TOKEN");
    if (!safeTokenEqual(req.headers["asaas-access-token"], expectedToken)) {
      return res.status(401).json({ error: "Webhook nao autorizado." });
    }

    const payload = req.body || {};
    eventId = String(payload.id || "").trim();
    const eventType = String(payload.event || "").trim();
    if (!eventId || !eventType) {
      return res.status(400).json({ error: "Evento invalido." });
    }

    admin = getAdminClient();
    const { error: eventError } = await admin
      .from("billing_webhook_events")
      .insert({ provider_event_id: eventId, event_type: eventType });

    if (eventError?.code === "23505") {
      const { data: previous, error: previousError } = await admin
        .from("billing_webhook_events")
        .select("processing_status")
        .eq("provider_event_id", eventId)
        .single();
      if (previousError) throw previousError;
      if (previous.processing_status === "processed" || previous.processing_status === "ignored") {
        return res.status(200).json({ ok: true, duplicate: true });
      }
      await admin
        .from("billing_webhook_events")
        .update({ processing_status: "received", processed_at: null })
        .eq("provider_event_id", eventId);
    }
    if (eventError && eventError.code !== "23505") throw eventError;

    const status = getSubscriptionStatus(eventType);
    const reference = parseBillingReference(getBillingReference(payload));
    if (!status || !reference) {
      await admin
        .from("billing_webhook_events")
        .update({ processing_status: "ignored", processed_at: new Date().toISOString() })
        .eq("provider_event_id", eventId);
      return res.status(200).json({ ok: true, ignored: true });
    }

    const providerSubscriptionId = getProviderSubscriptionId(payload);
    const subscription = {
      user_id: reference.userId,
      provider: "asaas",
      provider_subscription_id: providerSubscriptionId || `event:${eventId}`,
      plan_id: reference.planId,
      status,
      metadata: { last_event: eventType, last_event_id: eventId },
      updated_date: new Date().toISOString(),
    };

    const { error: subscriptionError } = await admin
      .from("subscriptions")
      .upsert(subscription, { onConflict: "provider_subscription_id" });
    if (subscriptionError) throw subscriptionError;

    const profileUpdate = status === "active"
      ? { plan_id: reference.planId, subscription_status: "active", trial_ends_at: null }
      : status === "canceled"
        ? { plan_id: "free", subscription_status: "canceled", trial_ends_at: null }
        : { subscription_status: status };
    const { error: profileError } = await admin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", reference.userId);
    if (profileError) throw profileError;

    await admin
      .from("billing_webhook_events")
      .update({ processing_status: "processed", processed_at: new Date().toISOString() })
      .eq("provider_event_id", eventId);

    return res.status(200).json({ ok: true });
  } catch (error) {
    if (admin && eventId) {
      await admin
        .from("billing_webhook_events")
        .update({ processing_status: "failed", processed_at: new Date().toISOString() })
        .eq("provider_event_id", eventId)
        .catch(() => {});
    }
    return serverError(res, error, "Nao foi possivel processar o evento de pagamento.");
  }
}

import crypto from "node:crypto";

const ACTIVE_EVENTS = new Set([
  "CHECKOUT_PAID",
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
]);

const PAST_DUE_EVENTS = new Set([
  "PAYMENT_OVERDUE",
  "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
]);

const CANCELED_EVENTS = new Set([
  "CHECKOUT_CANCELED",
  "CHECKOUT_EXPIRED",
  "PAYMENT_DELETED",
  "PAYMENT_REFUNDED",
  "PAYMENT_REFUND_IN_PROGRESS",
]);

export const safeTokenEqual = (received, expected) => {
  const left = Buffer.from(String(received || ""));
  const right = Buffer.from(String(expected || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

export const getBillingReference = (payload = {}) => (
  payload?.checkout?.externalReference ||
  payload?.payment?.externalReference ||
  payload?.subscription?.externalReference ||
  payload?.externalReference ||
  ""
);

export const parseBillingReference = (reference) => {
  const match = /^consuobra:([0-9a-f-]{36}):(essential|professional)$/i.exec(String(reference || ""));
  if (!match) return null;
  return { userId: match[1].toLowerCase(), planId: match[2].toLowerCase() };
};

export const getSubscriptionStatus = (event) => {
  if (ACTIVE_EVENTS.has(event)) return "active";
  if (PAST_DUE_EVENTS.has(event)) return "past_due";
  if (CANCELED_EVENTS.has(event)) return "canceled";
  return null;
};

export const getProviderSubscriptionId = (payload = {}) => (
  payload?.subscription?.id ||
  payload?.payment?.subscription ||
  payload?.checkout?.subscription?.id ||
  null
);


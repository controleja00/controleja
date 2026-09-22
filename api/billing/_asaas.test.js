import { describe, expect, it } from "vitest";
import {
  buildCheckoutPayload,
  getBillingReference,
  getSubscriptionStatus,
  parseBillingReference,
  safeTokenEqual,
} from "./_asaas.js";

describe("Asaas billing helpers", () => {
  it("validates webhook tokens without accepting partial values", () => {
    expect(safeTokenEqual("secret-value", "secret-value")).toBe(true);
    expect(safeTokenEqual("secret", "secret-value")).toBe(false);
  });

  it("parses only supported Consuobra billing references", () => {
    const id = "36cf51c3-b4c6-4a34-8e50-a0b9cdbf5219";
    expect(parseBillingReference(`consuobra:${id}:professional`)).toEqual({ userId: id, planId: "professional" });
    expect(parseBillingReference(`consuobra:${id}:enterprise`)).toBeNull();
  });

  it("maps financial events to subscription states", () => {
    expect(getSubscriptionStatus("PAYMENT_RECEIVED")).toBe("active");
    expect(getSubscriptionStatus("PAYMENT_OVERDUE")).toBe("past_due");
    expect(getSubscriptionStatus("PAYMENT_REFUNDED")).toBe("canceled");
    expect(getSubscriptionStatus("PAYMENT_CREATED")).toBeNull();
  });

  it("reads references from supported Asaas resources", () => {
    expect(getBillingReference({ payment: { externalReference: "ref" } })).toBe("ref");
  });

  it("builds a recurrent checkout tied to the authenticated user", () => {
    const id = "36cf51c3-b4c6-4a34-8e50-a0b9cdbf5219";
    const payload = buildCheckoutPayload({
      userId: id,
      planId: "essential",
      origin: "https://consuobra.com.br",
      firstDueDate: "2026-10-01T12:00:00.000Z",
    });
    expect(payload.externalReference).toBe(`consuobra:${id}:essential`);
    expect(payload.items[0].value).toBe(19.9);
    expect(payload.subscription.cycle).toBe("MONTHLY");
  });
});

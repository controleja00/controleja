import { describe, expect, it } from "vitest";
import { CONSUOBRA_PLANS, getPlanById, getUserPlanId, isPaidPlan, TRIAL_DAYS } from "./plans";

describe("plan rules", () => {
  it("keeps the free plan limited to one active project", () => {
    expect(getPlanById("free").limits.activeProjects).toBe(1);
  });

  it("falls back to the free plan for an unknown identifier", () => {
    expect(getPlanById("invalid").id).toBe("free");
    expect(getUserPlanId()).toBe("free");
  });

  it("recognizes only billable plans as paid", () => {
    expect(isPaidPlan("free")).toBe(false);
    expect(isPaidPlan("essential")).toBe(true);
    expect(isPaidPlan("professional")).toBe(true);
  });

  it("keeps commercial values consistent", () => {
    expect(TRIAL_DAYS).toBe(7);
    expect(CONSUOBRA_PLANS.map((plan) => plan.id)).toEqual(["free", "essential", "professional"]);
  });
});

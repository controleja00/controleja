import { describe, expect, it, vi } from "vitest";
import { runCheck, summarizeChecks } from "./_checks.js";

describe("operational monitoring", () => {
  it("reports successful checks with latency", async () => {
    const result = await runCheck("site", vi.fn().mockResolvedValue({ ok: true, status: 200 }));
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("keeps internal exception details out of the public result", async () => {
    const result = await runCheck("database", vi.fn().mockRejectedValue(new Error("secret connection text")));
    expect(result.ok).toBe(false);
    expect(result.error).toBe("request_failed");
    expect(JSON.stringify(result)).not.toContain("secret connection text");
  });

  it("summarizes failed services", () => {
    expect(summarizeChecks([
      { name: "site", ok: true },
      { name: "auth", ok: false },
    ])).toEqual({ ok: false, failed: ["auth"] });
  });
});


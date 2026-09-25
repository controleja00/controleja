import { describe, expect, it } from "vitest";
import { isRecentLogin, matchesDeleteConfirmation } from "./_account.js";

describe("account protection", () => {
  it("requires the exact account email", () => {
    expect(matchesDeleteConfirmation(" Pessoa@Email.com ", "pessoa@email.com")).toBe(true);
    expect(matchesDeleteConfirmation("EXCLUIR", "pessoa@email.com")).toBe(false);
  });

  it("requires a login within 15 minutes", () => {
    const now = Date.parse("2026-09-25T12:00:00Z");
    expect(isRecentLogin("2026-09-25T11:50:00Z", now)).toBe(true);
    expect(isRecentLogin("2026-09-25T11:40:00Z", now)).toBe(false);
  });
});

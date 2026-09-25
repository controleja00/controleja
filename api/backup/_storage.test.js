import { describe, expect, it } from "vitest";
import { isStorageFile, storagePathFromUrl, toBackupPath } from "./_storage.js";

describe("storage backup helpers", () => {
  it("creates a deterministic private backup path", () => {
    expect(toBackupPath("private-files", "/owner/report.pdf"))
      .toBe("supabase-storage/private-files/owner/report.pdf");
  });

  it("extracts only private storage paths", () => {
    expect(storagePathFromUrl("private://owner/report.pdf")).toBe("owner/report.pdf");
    expect(storagePathFromUrl("https://example.com/report.pdf")).toBe("");
  });

  it("distinguishes files from virtual folders", () => {
    expect(isStorageFile({ id: "file-id", name: "report.pdf" })).toBe(true);
    expect(isStorageFile({ id: null, metadata: null, name: "owner" })).toBe(false);
  });

  it("rejects unsafe paths", () => {
    expect(() => toBackupPath("private-files", "../secret")).toThrow("invalido");
  });
});


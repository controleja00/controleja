import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES, validateUploadFile } from "./fileUpload.js";

const file = (overrides = {}) => ({ name: "arquivo.pdf", type: "application/pdf", size: 1024, ...overrides });

describe("file upload validation", () => {
  it("accepts supported files", () => {
    expect(validateUploadFile(file()).name).toBe("arquivo.pdf");
  });

  it("rejects executable or unknown formats", () => {
    expect(() => validateUploadFile(file({ type: "application/x-msdownload" }))).toThrow("Formato nao permitido");
  });

  it("rejects empty and oversized files", () => {
    expect(() => validateUploadFile(file({ size: 0 }))).toThrow("vazio");
    expect(() => validateUploadFile(file({ size: MAX_UPLOAD_BYTES + 1 }))).toThrow("25 MB");
  });
});


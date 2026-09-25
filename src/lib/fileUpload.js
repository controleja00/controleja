export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "audio/webm",
]);

const formatMb = (bytes) => Math.round(bytes / 1024 / 1024);

export const validateUploadFile = (file) => {
  if (!file) throw new Error("Arquivo nao informado.");
  if (file.size <= 0) throw new Error("O arquivo esta vazio.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`O arquivo ultrapassa o limite de ${formatMb(MAX_UPLOAD_BYTES)} MB.`);
  }
  if (!ALLOWED_UPLOAD_TYPES.has(String(file.type || "").toLowerCase())) {
    throw new Error("Formato nao permitido. Envie imagem, PDF, Word, Excel ou audio WebM.");
  }
  return file;
};


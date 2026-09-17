import { badRequest, methodNotAllowed, serverError, requireEnv } from "../_http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { audio_url: audioUrl } = req.body || {};
  if (!audioUrl || typeof audioUrl !== "string") return badRequest(res, "Audio nao informado.");

  try {
    const parsedUrl = new URL(audioUrl);
    if (parsedUrl.protocol !== "https:") throw new Error("Audio precisa usar HTTPS.");

    const apiKey = requireEnv("OPENAI_API_KEY");
    const source = await fetch(parsedUrl.toString());
    if (!source.ok) throw new Error("Nao foi possivel baixar o audio.");

    const blob = await source.blob();
    const form = new FormData();
    form.append("file", blob, "audio.webm");
    form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
    form.append("language", "pt");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message || "Falha ao transcrever audio.");

    return res.status(200).json({ text: payload.text || "" });
  } catch (error) {
    return serverError(res, error, "Transcricao temporariamente indisponivel.");
  }
}

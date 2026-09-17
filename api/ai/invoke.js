import { badRequest, methodNotAllowed, serverError, requireEnv } from "../_http.js";

const getTextFromResponse = (payload) => {
  if (payload.output_text) return payload.output_text;
  const firstText = payload.output
    ?.flatMap((item) => item.content || [])
    ?.find((content) => content.type === "output_text" || content.type === "text");
  return firstText?.text || "";
};

const parseJsonSafely = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("A IA nao retornou JSON valido.");
    return JSON.parse(match[0]);
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { prompt, response_json_schema: responseJsonSchema } = req.body || {};
  if (!prompt || typeof prompt !== "string") return badRequest(res, "Prompt nao informado.");

  try {
    const apiKey = requireEnv("OPENAI_API_KEY");
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const body = {
      model,
      input: prompt,
    };

    if (responseJsonSchema) {
      body.text = {
        format: {
          type: "json_schema",
          name: "consuobra_response",
          schema: responseJsonSchema,
          strict: false,
        },
      };
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || "Falha ao acionar a IA.");
    }

    const text = getTextFromResponse(payload);
    if (responseJsonSchema) return res.status(200).json({ data: parseJsonSafely(text), text });
    return res.status(200).json({ text });
  } catch (error) {
    return serverError(res, error, "IA temporariamente indisponivel. Verifique a chave OPENAI_API_KEY.");
  }
}

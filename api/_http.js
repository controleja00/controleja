export function methodNotAllowed(res) {
  return res.status(405).json({ error: "Metodo nao permitido." });
}

export function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

export function serverError(res, error, fallback = "Servico indisponivel no momento.") {
  console.error(error);
  return res.status(500).json({ error: fallback });
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variavel de ambiente ausente: ${name}`);
  return value;
}

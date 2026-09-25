const DEFAULT_TIMEOUT_MS = 8000;

export const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

export const runCheck = async (name, operation) => {
  const startedAt = Date.now();
  try {
    const response = await operation();
    const ok = Boolean(response?.ok);
    return {
      name,
      ok,
      status: response?.status || 0,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      status: 0,
      latencyMs: Date.now() - startedAt,
      error: error?.name === "AbortError" ? "timeout" : "request_failed",
    };
  }
};

export const summarizeChecks = (checks) => ({
  ok: checks.every((check) => check.ok),
  failed: checks.filter((check) => !check.ok).map((check) => check.name),
});


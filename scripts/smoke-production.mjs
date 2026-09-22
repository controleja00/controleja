import assert from "node:assert/strict";

const origin = process.env.SMOKE_ORIGIN || "https://consuobra.com.br";
const publicRoutes = ["/", "/login", "/register", "/privacy", "/terms", "/plans", "/support"];

for (const route of publicRoutes) {
  const response = await fetch(`${origin}${route}`, { redirect: "manual" });
  assert.equal(response.status, 200, `${route} returned ${response.status}`);
  assert.equal(response.headers.get("x-frame-options"), "DENY", `${route} is missing frame protection`);
  assert.match(
    response.headers.get("content-security-policy") || "",
    /frame-ancestors 'none'/,
    `${route} is missing CSP`
  );
}

const healthResponse = await fetch(`${origin}/api/health`, { cache: "no-store" });
assert.equal(healthResponse.status, 200, "health endpoint is unavailable");
const health = await healthResponse.json();
assert.equal(health.status, "operational", `service is ${health.status}`);
assert.equal(health.checks.supabase, true, "Supabase is not configured");
assert.equal(health.checks.email, true, "transactional email is not configured");

console.log(`Production smoke test passed for ${origin}`);

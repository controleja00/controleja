export default function handler(_request, response) {
  const checks = {
    supabase: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY),
    email: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    ai: Boolean(process.env.OPENAI_API_KEY),
    payments: Boolean(
      process.env.VITE_ASAAS_ESSENTIAL_CHECKOUT_URL &&
      process.env.VITE_ASAAS_PROFESSIONAL_CHECKOUT_URL
    ),
  };

  response.setHeader("Cache-Control", "no-store");
  response.status(200).json({
    status: checks.supabase && checks.email ? "operational" : "degraded",
    service: "consuobra",
    timestamp: new Date().toISOString(),
    checks,
  });
}

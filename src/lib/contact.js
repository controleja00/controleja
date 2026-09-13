export const CONTACT_EMAILS = {
  support: "suporte@consuobra.com.br",
  contact: "contato@consuobra.com.br",
  billing: "financeiro@consuobra.com.br",
};

export const CONTACT_LINKS = {
  supportEmail: `mailto:${CONTACT_EMAILS.support}`,
  contactEmail: `mailto:${CONTACT_EMAILS.contact}`,
  billingEmail: `mailto:${CONTACT_EMAILS.billing}`,
  whatsapp: import.meta.env.VITE_PUBLIC_WHATSAPP_URL || "",
};

export const getSupportRecipient = (category = "") => {
  const normalized = category.toLowerCase();
  if (normalized.includes("financeiro") || normalized.includes("cobran")) {
    return CONTACT_EMAILS.billing;
  }
  return CONTACT_EMAILS.support;
};

export const ACCOUNT_TABLES = [
  "projects",
  "subcontractors",
  "measurements",
  "cash_flow_entries",
  "documents",
  "alerts",
  "daily_reports",
  "client_portal_configs",
  "progress_history",
  "supplies",
  "hiring_requests",
  "guarantees",
  "audit_logs",
  "benchmarks",
];

export const isRecentLogin = (lastSignInAt, now = Date.now()) => {
  const signedIn = new Date(lastSignInAt || 0).getTime();
  return Number.isFinite(signedIn) && now - signedIn <= 15 * 60 * 1000;
};

export const matchesDeleteConfirmation = (confirmation, email) => (
  String(confirmation || "").trim().toLowerCase() === String(email || "").trim().toLowerCase()
);

export const listUserFiles = async (storage, bucket, userId) => {
  const files = [];
  const folders = [userId];
  while (folders.length) {
    const prefix = folders.shift();
    let offset = 0;
    while (true) {
      const { data, error } = await storage.from(bucket).list(prefix, { limit: 100, offset });
      if (error) throw error;
      for (const item of data || []) {
        const path = `${prefix}/${item.name}`;
        if (item.id || item.metadata) files.push({ path, size: Number(item.metadata?.size || 0) });
        else folders.push(path);
      }
      if (!data || data.length < 100) break;
      offset += 100;
    }
  }
  return files;
};

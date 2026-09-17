import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

const TABLES = {
  Alert: "alerts",
  AuditLog: "audit_logs",
  Benchmark: "benchmarks",
  CashFlowEntry: "cash_flow_entries",
  ClientPortalConfig: "client_portal_configs",
  DailyReport: "daily_reports",
  Document: "documents",
  Guarantee: "guarantees",
  HiringRequest: "hiring_requests",
  Measurement: "measurements",
  ProgressHistory: "progress_history",
  Project: "projects",
  Subcontractor: "subcontractors",
  Supply: "supplies",
};

const conversations = new Map();

const requireSupabase = () => {
  if (!supabase) {
    throw new Error(
      "Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel."
    );
  }
  return supabase;
};

const stripUndefined = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));
};

const normalizeWrite = (payload = {}, { includeOwner = false } = {}) => {
  const copy = stripUndefined({ ...payload });
  delete copy.created_date;
  delete copy.updated_date;
  delete copy.created_by;
  if (!includeOwner) delete copy.created_by_id;
  Object.keys(copy).forEach((field) => {
    if (copy[field] === "" && field.endsWith("_id")) {
      copy[field] = null;
    }
    if (
      copy[field] === "" &&
      (field.endsWith("_date") || field.endsWith("_at") || field === "date" || field === "due_date")
    ) {
      copy[field] = null;
    }
  });
  return copy;
};

const normalizeUser = (authUser, profile = {}) => {
  if (!authUser) return null;

  return {
    id: authUser.id,
    email: authUser.email,
    role: "user",
    ...authUser.user_metadata,
    ...profile,
  };
};

const getProfile = async (userId) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data || {};
};

const ensureProfile = async (authUser) => {
  if (!authUser?.id) return null;
  const client = requireSupabase();
  const payload = {
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
  };

  const { data, error } = await client
    .from("profiles")
    .insert(payload)
    .select("*")
    .single();

  if (error?.code === "23505") return getProfile(authUser.id);
  if (error) throw error;
  return data;
};

const applyFilters = (query, filters = {}) => {
  Object.entries(filters || {}).forEach(([field, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      query = query.in(field, value);
    } else {
      query = query.eq(field, value);
    }
  });
  return query;
};

const applySort = (query, sort) => {
  if (!sort || typeof sort !== "string") return query;
  const ascending = !sort.startsWith("-");
  const column = ascending ? sort : sort.slice(1);
  if (!column) return query;
  return query.order(column, { ascending });
};

const createEntity = (name) => {
  const table = TABLES[name];
  if (!table) throw new Error(`Entidade desconhecida: ${name}`);

  return {
    async list(sort = "-created_date", limit) {
      const client = requireSupabase();
      let query = client.from(table).select("*");
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async filter(filters = {}, sort, limit) {
      const client = requireSupabase();
      let query = client.from(table).select("*");
      query = applyFilters(query, filters);
      query = applySort(query, sort);
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const client = requireSupabase();
      const { data, error } = await client.from(table).select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Registro nao encontrado.");
      return data;
    },

    async create(payload) {
      const client = requireSupabase();
      const { data, error } = await client
        .from(table)
        .insert(normalizeWrite(payload))
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },

    async update(id, payload) {
      const client = requireSupabase();
      const { data, error } = await client
        .from(table)
        .update(normalizeWrite(payload))
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const client = requireSupabase();
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw error;
      return { id };
    },
  };
};

const apiPost = async (path, body) => {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Servico indisponivel no momento.");
  return payload;
};

const safeSameOriginPath = (value, fallback = "/dashboard") => {
  if (!value || typeof value !== "string" || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, window.location.origin);
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (url.origin !== window.location.origin) return fallback;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
    return path;
  } catch {
    return fallback;
  }
};

const invokeLLM = async (request = {}) => {
  const result = await apiPost("/api/ai/invoke", request);
  return request.response_json_schema ? result.data : result.text;
};

const uploadFile = async ({ file }) => {
  if (!file) throw new Error("Arquivo nao informado.");
  const client = requireSupabase();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) throw new Error("Faca login para enviar arquivos.");

  const safeName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .toLowerCase();
  const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await client.storage.from("app-files").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;
  const { data } = client.storage.from("app-files").getPublicUrl(path);
  return { file_url: data.publicUrl, path };
};

const createAgentsAdapter = () => ({
  async createConversation({ metadata } = {}) {
    const id = crypto.randomUUID();
    const conversation = { id, metadata: metadata || {}, messages: [], subscribers: new Set() };
    conversations.set(id, conversation);
    return conversation;
  },

  subscribeToConversation(id, callback) {
    const conversation = conversations.get(id);
    if (!conversation) return () => {};
    conversation.subscribers.add(callback);
    callback({ messages: conversation.messages });
    return () => conversation.subscribers.delete(callback);
  },

  async addMessage(conversationOrId, message) {
    const id = typeof conversationOrId === "string" ? conversationOrId : conversationOrId?.id;
    const conversation = conversations.get(id);
    if (!conversation) throw new Error("Conversa nao encontrada.");

    conversation.messages.push(message);
    conversation.subscribers.forEach((callback) => callback({ messages: conversation.messages }));

    if (message.role === "user") {
      const answer = await invokeLLM({
        prompt: `Voce e o gerente IA da Consuobra. Responda de forma objetiva, pratica e em portugues do Brasil.\n\nPergunta do usuario:\n${message.content}`,
      }).catch((error) => `Nao consegui acionar a IA agora: ${error.message}`);
      conversation.messages.push({ role: "assistant", content: answer });
      conversation.subscribers.forEach((callback) => callback({ messages: conversation.messages }));
    }
  },
});

export const consuobra = {
  auth: {
    async me() {
      const client = requireSupabase();
      const {
        data: { user },
        error,
      } = await client.auth.getUser();
      if (error || !user) throw error || new Error("Usuario nao autenticado.");
      const profile = await getProfile(user.id).catch(() => ensureProfile(user));
      return normalizeUser(user, profile);
    },

    async isAuthenticated() {
      if (!supabase) return false;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return Boolean(session?.user);
    },

    async loginViaEmailPassword(email, password) {
      const client = requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await ensureProfile(data.user);
      return data;
    },

    async register({ email, password, plan_id = "free" }) {
      const client = requireSupabase();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            requested_plan: plan_id,
          },
        },
      });
      if (error) throw error;
      if (data.user && data.session) await ensureProfile(data.user);
      return data;
    },

    async verifyOtp({ email, otpCode }) {
      const client = requireSupabase();
      const { data, error } = await client.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });
      if (error) throw error;
      await ensureProfile(data.user);
      return {
        ...data,
        access_token: data.session?.access_token,
      };
    },

    async resendOtp(email) {
      const client = requireSupabase();
      const { data, error } = await client.auth.resend({ type: "signup", email });
      if (error) throw error;
      return data;
    },

    async setToken() {
      return null;
    },

    async updateMe(profile) {
      const client = requireSupabase();
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();
      if (userError || !user) throw userError || new Error("Usuario nao autenticado.");

      const allowedFields = ["full_name", "phone", "company_name", "company_type", "cnpj", "job_title", "onboarding_goal"];
      const payload = Object.fromEntries(
        Object.entries(normalizeWrite(profile, { includeOwner: true }))
          .filter(([field]) => allowedFields.includes(field))
      );
      const { data, error } = await client
        .from("profiles")
        .update(payload)
        .eq("id", user.id)
        .select("*")
        .single();
      if (error) throw error;
      return normalizeUser(user, data);
    },

    async logout(redirectTo) {
      if (supabase) await supabase.auth.signOut().catch(() => {});
      if (redirectTo && typeof redirectTo === "string") {
        window.location.href = redirectTo === "/" ? "/" : "/login";
      }
    },

    redirectToLogin(fromUrl = window.location.href) {
      const next = safeSameOriginPath(fromUrl);
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
    },

    async resetPasswordRequest(email) {
      const client = requireSupabase();
      const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    },

    async resetPassword({ newPassword }) {
      const client = requireSupabase();
      const { data, error } = await client.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return data;
    },

    async loginWithGoogle(fromPath = "/dashboard") {
      const client = requireSupabase();
      const redirectTo = new URL(safeSameOriginPath(fromPath), window.location.origin).toString();
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
      return data;
    },
  },

  entities: Object.fromEntries(Object.keys(TABLES).map((name) => [name, createEntity(name)])),

  integrations: {
    Core: {
      UploadFile: uploadFile,
      InvokeLLM: invokeLLM,
      SendEmail: (request) => apiPost("/api/email/send", request),
      TranscribeAudio: async (request) => {
        const result = await apiPost("/api/audio/transcribe", request);
        return result.text;
      },
    },
  },

  agents: createAgentsAdapter(),

  portal: {
    async getByToken(token) {
      const client = requireSupabase();
      const { data, error } = await client.rpc("get_client_portal_by_token", { p_token: token });
      if (error) throw error;
      if (!data) throw new Error("Portal nao encontrado.");
      return data;
    },
  },
};

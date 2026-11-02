export function publishedStoreConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function supabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function supabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export const PUBLISHER_COOKIE = "arya-publisher-v1";
export const PUBLISHER_HANDLE_KEY = "arya-publisher-handle";
export const PUBLISHED_IMAGE_MAX_CHARS = 1_200_000;
export const PUBLISHED_LIST_LIMIT = 24;

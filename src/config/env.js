export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    restUrl: import.meta.env.VITE_SUPABASE_REST_URL
  },
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL
  }
}

// Validación para asegurar que las variables existen
if (!config.supabase.url || !config.supabase.anonKey || !config.api.baseURL || !config.supabase.restUrl) {
  throw new Error('Missing required environment variables. Please check your .env file.')
}
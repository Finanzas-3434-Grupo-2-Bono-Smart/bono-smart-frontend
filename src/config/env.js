export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://knejsumeeaqqmrilyfeh.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZWpzdW1lZWFxcW1yaWx5ZmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTIxMjAsImV4cCI6MjA2NjQ4ODEyMH0.aNm_VnexWY_padcSdHxRssAiIQo8IYwuXBLAFfzi318'
  },
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://knejsumeeaqqmrilyfeh.supabase.co/auth/v1'
  }
}

// Validación para asegurar que las variables existen
if (!config.supabase.url || !config.supabase.anonKey || !config.api.baseURL) {
  throw new Error('Missing required environment variables. Please check your .env file.')
}
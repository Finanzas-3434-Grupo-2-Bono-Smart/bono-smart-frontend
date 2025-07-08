import { config } from '@/config/env'

class AuthService {
  constructor() {
    if (!config.supabase.url || !config.supabase.anonKey) {
      throw new Error('Missing Supabase configuration.')
    }
    this.authURL = `${config.supabase.url}/auth/v1`
    this.apiKey = config.supabase.anonKey
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.authURL}${endpoint}`

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, requestConfig)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `Error, inicio de sesión: ${response.status}`)
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Auth request failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async register(email, password) {
    return await this.makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async login(email, password) {
    const result = await this.makeRequest('/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    if (result.success) {
      const userId = result.data.user?.id
      if (userId) localStorage.setItem('user_id', userId)
    }

    return result
  }

  logout() {
    localStorage.removeItem('user_id')
  }

  getUserId() {
    return localStorage.getItem('user_id')
  }
}

export default new AuthService()

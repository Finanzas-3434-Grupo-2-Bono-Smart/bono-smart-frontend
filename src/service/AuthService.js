import { config } from '@/config/env'

class AuthService {
  constructor() {
    if (!config.api.baseURL || !config.supabase.anonKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.')
    }
    this.baseURL = config.api.baseURL
    this.apiKey = config.supabase.anonKey
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
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
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('API Request failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async register(email, password) {
    return await this.makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    })
  }

  async login(email, password) {
    return await this.makeRequest('/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    })
  }
}

export default new AuthService()
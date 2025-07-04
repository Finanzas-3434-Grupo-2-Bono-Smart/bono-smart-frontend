import { config } from '@/config/env'

class BondService {
  constructor() {
    if (!config.supabase.url || !config.supabase.anonKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.')
    }
    this.baseURL = `${config.supabase.url}/rest/v1`
    this.apiKey = config.supabase.anonKey
  }

  getAuthHeaders() {
    const token = localStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
      'Prefer': 'return=representation',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const requestConfig = {
      headers: {
        ...this.getAuthHeaders(),
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
      console.error('Bond API Request failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async createBond(bondData) {
    return await this.makeRequest('/bonds', {
      method: 'POST',
      body: JSON.stringify(bondData)
    })
  }

  async getBondsByUser(userId) {
    return await this.makeRequest(`/bonds?user_id=eq.${userId}`)
  }

  async updateBond(bondId, bondData) {
    return await this.makeRequest(`/bonds?id=eq.${bondId}`, {
      method: 'PATCH',
      body: JSON.stringify(bondData)
    })
  }

  async deleteBond(bondId) {
    return await this.makeRequest(`/bonds?id=eq.${bondId}`, {
      method: 'DELETE'
    })
  }
}

export default new BondService()

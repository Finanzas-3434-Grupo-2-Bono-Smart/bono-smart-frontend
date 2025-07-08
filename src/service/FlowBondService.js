import { config } from '@/config/env'

class FlowBondService {
    constructor() {
        if (!config.supabase.url || !config.supabase.anonKey) {
            throw new Error('Missing Supabase configuration. Please check your environment variables.')
        }
        this.baseURL = config.supabase.restUrl
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

    async getMetricsByBondId(bondId) {
        return await this.makeRequest(`/bond_metrics?bond_id=eq.${bondId}`);
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
            console.error('FlowBond API Request failed:', error)
            return {
                success: false,
                error: error.message
            }
        }
    }

    async getFlowsByBondId(bondId) {
        // Obtiene los flujos de un bono específico
        return await this.makeRequest(`/bond_flows?bond_id=eq.${bondId}&order=periodo.asc`)
    }
}

export default new FlowBondService()

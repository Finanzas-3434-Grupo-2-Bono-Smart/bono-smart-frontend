import { ref, computed } from 'vue'

// Estado global de autenticación
const currentUser = ref(null)
const accessToken = ref(null)
const isAuthenticated = computed(() => !!currentUser.value && !!accessToken.value)

export function useAuth() {
  const user = ref(currentUser.value)
  const token = ref(accessToken.value)

  const setUser = (userData) => {
    currentUser.value = userData
    user.value = userData
  }

  const setToken = (tokenData) => {
    accessToken.value = tokenData
    token.value = tokenData
    
    // Guardar en localStorage para persistencia
    if (tokenData) {
      localStorage.setItem('access_token', tokenData)
    } else {
      localStorage.removeItem('access_token')
    }
  }

  const setAuthData = (authResponse) => {
    console.log('Setting auth data:', authResponse) // Para debugging
    
    if (authResponse && authResponse.user && authResponse.access_token) {
      setUser(authResponse.user)
      setToken(authResponse.access_token)
      
      // Guardar datos específicos en localStorage
      localStorage.setItem('user_data', JSON.stringify(authResponse.user))
      localStorage.setItem('user_id', authResponse.user.id)
      localStorage.setItem('user_email', authResponse.user.email)
      
      console.log('User ID saved:', authResponse.user.id) // Para debugging
    }
  }

  const logout = () => {
    currentUser.value = null
    accessToken.value = null
    user.value = null
    token.value = null
    
    // Limpiar todos los datos de localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
  }

  const initializeAuth = () => {
    // Recuperar datos de localStorage al inicializar
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user_data')
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setToken(savedToken)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        logout()
      }
    }
  }

  // Función helper para obtener el ID del usuario
  const getUserId = () => {
    // Primer intento: desde el estado actual
    if (currentUser.value?.id) {
      return currentUser.value.id
    }
    
    // Segundo intento: desde localStorage directo
    const savedUserId = localStorage.getItem('user_id')
    if (savedUserId) {
      return savedUserId
    }
    
    // Tercer intento: desde user_data completo
    const savedUser = localStorage.getItem('user_data')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        return userData.id
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    
    return null
  }

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    setAuthData,
    logout,
    initializeAuth,
    getUserId
  }
}

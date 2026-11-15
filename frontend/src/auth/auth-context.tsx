import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export type User = {
  id: string
  username: string
  email?: string
  full_name?: string
}

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: () => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a session cookie
        const userId = document.cookie.replace(
          /(?:(?:^|.*;\s*)sc_session\s*\=\s*([^;]*).*$)|^.*$/,
          '$1'
        )
        
        if (userId) {
          setUser({ id: userId, username: userId })
        }
      } catch (e) {
        console.error('Auth check error:', e)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = () => {
    // Redirect to Keycloak login
    const authUrl = '/auth/login'
    navigate(authUrl)
  }

  const logout = async () => {
    // Clear session cookie
    document.cookie = `sc_session=; Max-Age=0; path=/; SameSite=Lax`
    document.cookie = `sc_refresh_token=; Max-Age=0; path=/; SameSite=Lax; Secure`
    setUser(null)
    navigate('/')
  }

  if (isLoading) {
    return <div>Loading auth state...</div>
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading: false,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

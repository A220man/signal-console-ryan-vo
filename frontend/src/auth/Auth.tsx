import { useState } from 'react'

type AuthStatus = 'unauthenticated' | 'authenticated' | 'loading'

interface AuthProps {
  onAuthChange: (status: AuthStatus, user?: { id: string; username: string }) => void
}

const Auth: React.FC<AuthProps> = ({ onAuthChange }) => {
  const [status, setStatus] = useState<AuthStatus>('loading')

  // Check auth status from cookie on mount
  useEffect(() => {
    const checkAuth = () => {
      const userId = document.cookie.replace(
        /(?:(?:^|.*;\s*)sc_session\s*\=\s*([^;]*).*$)|^.*$/,
        '$1'
      )
      
      if (userId) {
        setStatus('authenticated')
        setStatus('authenticated')
        onAuthChange('authenticated', { id: userId, username: userId })
      } else {
        setStatus('unauthenticated')
        onAuthChange('unauthenticated')
      }
    }

    checkAuth()
  }, [])

  return null
}

export default Auth

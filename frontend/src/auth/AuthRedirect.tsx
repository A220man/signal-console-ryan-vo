import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const AuthRedirect = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // If already authenticated and trying to go to login/callback, redirect to dashboard
    if (location.pathname === '/auth/login' || location.pathname === '/auth/callback') {
      const userId = document.cookie.replace(
        /(?:(?:^|.*;\s*)sc_session\s*\=\s*([^;]*).*$)|^.*$/,
        '$1'
      )
      if (userId) {
        navigate('/')
      }
    }
  }, [location])

  return null
}

export default AuthRedirect

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()
const INACTIVITY_TIMEOUT = 5 * 60 * 1000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const timeoutRef = useRef(null)

  const resetInactivityTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (user) {
      timeoutRef.current = setTimeout(() => {
        signOut()
        navigate('/login?timeout=true')
      }, INACTIVITY_TIMEOUT)
    }
  }

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer)
    })
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [user])

  useEffect(() => {
    const verifyUser = async () => {
      const storedUser = localStorage.getItem('adminUser')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        const { data: admin } = await supabase
          .from('administradores')
          .select('*')
          .eq('id', userData.id)
          .single()
        
        if (admin) {
          setUser(userData)
        } else {
          localStorage.removeItem('adminUser')
        }
      }
      setLoading(false)
    }
    verifyUser()
  }, [])

  useEffect(() => {
    if (user) resetInactivityTimer()
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [user])

  const signIn = async (usuario, password) => {
    const { data: admin, error } = await supabase
      .from('administradores')
      .select('*')
      .eq('usuario', usuario)
      .single()

    if (error || !admin) {
      throw new Error('Credenciales incorrectas')
    }

    const simpleHash = btoa(password)
    if (admin.password_hash !== simpleHash) {
      throw new Error('Credenciales incorrectas')
    }

    const userData = { id: admin.id, usuario: admin.usuario, nombre: admin.nombre }
    setUser(userData)
    localStorage.setItem('adminUser', JSON.stringify(userData))
    return userData
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('adminUser')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
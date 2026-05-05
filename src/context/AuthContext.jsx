import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

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
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, MESAS_TABLE, RESERVAS_TABLE, HORARIOS_TABLE } from '../services/supabase'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [mesas, setMesas] = useState([])
  const [reservas, setReservas] = useState([])
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMesas = async () => {
    const { data, error } = await supabase
      .from(MESAS_TABLE)
      .select('*')
      .order('numero')
    if (!error) setMesas(data || [])
  }

  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from(RESERVAS_TABLE)
      .select('*')
      .order('fecha', { ascending: false })
    if (!error) setReservas(data || [])
  }

  const fetchHorarios = async () => {
    const { data, error } = await supabase
      .from(HORARIOS_TABLE)
      .select('*')
      .order('dia_semana')
    if (!error) setHorarios(data || [])
  }

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchMesas(), fetchReservas(), fetchHorarios()])
    setLoading(false)
  }

  const addMesa = async (mesa) => {
    const { data, error } = await supabase
      .from(MESAS_TABLE)
      .insert([mesa])
      .select()
    if (!error) {
      setMesas(prev => [...prev, data[0]].sort((a, b) => a.numero - b.numero))
      return data[0]
    }
    throw error
  }

  const updateMesa = async (id, updates) => {
    const { data, error } = await supabase
      .from(MESAS_TABLE)
      .update(updates)
      .eq('id', id)
      .select()
    if (error) {
      console.error('Error updating mesa:', error)
      throw error
    }
    if (data && data[0]) {
      setMesas(prev => prev.map(m => m && m.id === id ? data[0] : m))
      return data[0]
    }
    await fetchMesas()
  }

  const deleteMesa = async (id) => {
    const { error } = await supabase
      .from(MESAS_TABLE)
      .delete()
      .eq('id', id)
    if (!error) {
      setMesas(prev => prev.filter(m => m && m.id !== id))
    } else {
      throw error
    }
  }

  const addReserva = async (reserva) => {
    const { data, error } = await supabase
      .from(RESERVAS_TABLE)
      .insert([reserva])
      .select()
    if (!error) {
      setReservas(prev => [...prev, data[0]])
      await fetchMesas()
      return data[0]
    }
    throw error
  }

  const cancelReserva = async (id) => {
    const { error } = await supabase
      .from(RESERVAS_TABLE)
      .delete()
      .eq('id', id)
    if (!error) {
      setReservas(prev => prev.filter(r => r && r.id !== id))
      await fetchMesas()
    } else {
      throw error
    }
  }

  const addHorario = async (horario) => {
    const { data, error } = await supabase
      .from(HORARIOS_TABLE)
      .insert([horario])
      .select()
    if (!error) {
      setHorarios(prev => [...prev, data[0]].sort((a, b) => a.dia_semana - b.dia_semana))
      return data[0]
    }
    throw error
  }

  const updateHorario = async (id, updates) => {
    const { data, error } = await supabase
      .from(HORARIOS_TABLE)
      .update(updates)
      .eq('id', id)
      .select()
    if (!error) {
      setHorarios(prev => prev.map(h => h.id === id ? data[0] : h))
      return data[0]
    }
    throw error
  }

  const deleteHorario = async (id) => {
    const { error } = await supabase
      .from(HORARIOS_TABLE)
      .delete()
      .eq('id', id)
    if (!error) {
      setHorarios(prev => prev.filter(h => h && h.id !== id))
    } else {
      throw error
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return (
    <AppContext.Provider value={{
      mesas,
      reservas,
      horarios,
      loading,
      fetchAll,
      addMesa,
      updateMesa,
      deleteMesa,
      addReserva,
      cancelReserva,
      addHorario,
      updateHorario,
      deleteHorario
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider')
  }
  return context
}
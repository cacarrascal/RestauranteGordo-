import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function generarHoras(inicio, fin) {
  const horas = []
  for (let h = inicio; h <= fin; h++) {
    horas.push(`${h}:00`)
    if (h < fin) horas.push(`${h}:30`)
  }
  return horas
}

export default function Home() {
  const { mesas, reservas, horarios, loading, addReserva } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
  const [ fecha, setFecha] = useState(searchParams.get('fecha') || '')
  const [hora, setHora] = useState('')
  const [numPersonas, setNumPersonas] = useState(2)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [diaSemana, setDiaSemana] = useState(0)

  useEffect(() => {
    if (fecha) {
      const d = new Date(fecha)
      setDiaSemana(d.getDay())
    }
  }, [fecha])

  const horarioActivo = horarios.find(h => h.dia_semana === diaSemana && h.activo)
  const horasDisponibles = horarioActivo 
    ? generarHoras(parseInt(horarioActivo.hora_inicio), parseInt(horarioActivo.hora_fin))
    : []

  const getMesaEstado = (mesaId, fechaReserva, horaReserva) => {
    if (!fechaReserva || !horaReserva) return 'disponible'
    const ReservaConflicto = reservas.find(r => 
      r.mesa_id === mesaId &&
      r.fecha === fechaReserva &&
      r.hora === horaReserva &&
      r.estado !== 'cancelada'
    )
    if (ReservaConflicto) return 'ocupada'
    return 'disponible'
  }

  const getMesasConEstado = () => {
    return mesas.map(mesa => ({
      ...mesa,
      estado: mesa.estado === 'bloqueada' ? 'bloqueada' : getMesaEstado(mesa.id, fecha, hora)
    }))
  }

  const handleSeleccionarMesa = (mesa) => {
    if (mesa.estado === 'disponible') {
      setMesaSeleccionada(mesa)
      setError('')
    }
  }

  const validarFormulario = () => {
    if (!mesaSeleccionada) {
      setError('Selecciona una mesa')
      return false
    }
    if (!fecha) {
      setError('Selecciona una fecha')
      return false
    }
    if (!hora) {
      setError('Selecciona una hora')
      return false
    }
    if (numPersonas > mesaSeleccionada.capacidad) {
      setError(`La mesa solo tiene capacidad para ${mesaSeleccionada.capacidad} personas`)
      return false
    }
    if (!nombre.trim()) {
      setError('Ingresa tu nombre')
      return false
    }
    if (!telefono.trim()) {
      setError('Ingresa tu teléfono')
      return false
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresa un correo válido')
      return false
    }
    return true
  }

  const handleReservar = async () => {
    if (!validarFormulario()) return
    setGuardando(true)
    try {
      await addReserva({
        mesa_id: mesaSeleccionada.id,
        cliente_nombre: nombre.trim(),
        cliente_tel: telefono.trim(),
        cliente_email: email.trim(),
        fecha,
        hora,
        num_personas: numPersonas,
        estado: 'confirmada'
      })
      navigate(`/reserva-confirmada?mesa=${mesaSeleccionada.numero}&fecha=${fecha}&hora=${hora}&nombre=${encodeURIComponent(nombre)}`)
    } catch (err) {
      setError(err.message || 'Error al realizar la reserva')
    } finally {
      setGuardando(false)
    }
  }

  const obtenerFechaMin = () => {
    const hoy = new Date()
    return hoy.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    )
  }

  if (mesas.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-warning">
            En este momento no hay mesas disponibles. Por favor, intenta más tarde.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="container">
          <h1 className="hero-title">Reserva tu Mesa</h1>
          <p className="hero-subtitle">Comidas Rápidas The Gordo - Tu mejor opción</p>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-2" style={{ marginTop: '-2rem' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">1. Selecciona tu Mesa</h2>
            </div>
            <div className="legend mb-2">
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#d4edda' }}></div>
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#f8d7da' }}></div>
                <span>Ocupada</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#e2e3e5' }}></div>
                <span>Bloqueada</span>
              </div>
            </div>
            <div className="mesa-grid">
              {getMesasConEstado().map(mesa => (
                <div
                  key={mesa.id}
                  className={`mesa-item mesa-${mesa.estado} ${mesaSeleccionada?.id === mesa.id ? 'selected' : ''}`}
                  onClick={() => handleSeleccionarMesa(mesa)}
                >
                  <div className="mesa-numero">Mesa {mesa.numero}</div>
                  <div className="mesa-capacidad">Cap: {mesa.capacidad}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">2. Completa tu Reserva</h2>
            </div>
            
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-input"
                value={fecha}
                min={obtenerFechaMin()}
                onChange={(e) => { setFecha(e.target.value); setHora(''); }}
              />
            </div>

            {fecha && horasDisponibles.length > 0 && (
              <div className="form-group">
                <label className="form-label">Hora</label>
                <select
                  className="form-select"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                >
                  <option value="">Selecciona hora</option>
                  {horasDisponibles.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            )}

            {fecha && horasDisponibles.length === 0 && (
              <div className="alert alert-warning mb-2">
                No hay horarios disponibles para este día
              </div>
            )}

            <div className="form-group">
              <label className="form-label">N��mero de Personas</label>
              <select
                className="form-select"
                value={numPersonas}
                onChange={(e) => setNumPersonas(parseInt(e.target.value))}
              >
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-input"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="number"
                inputMode="numeric"
                className="form-input"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                placeholder="Tu número de teléfono"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleReservar}
              disabled={guardando || !mesaSeleccionada || !fecha || !hora}
            >
              {guardando ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
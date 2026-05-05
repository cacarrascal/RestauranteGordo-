import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function generarHoras(inicio, fin) {
  const horas = []
  for (let h = inicio; h <= fin; h++) {
    const period = h >= 12 ? 'pm' : 'am'
    const hour12 = h > 12 ? h - 12 : (h === 0 ? 12 : h)
    horas.push({ valor: `${h}`, display: `${hour12}:00 ${period}` })
    if (h < fin) horas.push({ valor: `${h}`, display: `${hour12}:30 ${period}` })
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [diaSemana, setDiaSemana] = useState(new Date().getDay())

  useEffect(() => {
    if (fecha) {
      const d = new Date(fecha)
      setDiaSemana(d.getDay())
      setHora('')
    }
  }, [fecha])

  const horarioActivo = horarios.find(h => h.dia_semana === diaSemana && h.activo)
  let horasDisponibles = horarioActivo 
    ? generarHoras(parseInt(horarioActivo.hora_inicio), parseInt(horarioActivo.hora_fin))
    : []

  if (fecha === new Date().toISOString().split('T')[0]) {
    const ahora = new Date()
    const horaActual = ahora.getHours()
    const minutoActual = ahora.getMinutes()
    horasDisponibles = horasDisponibles.filter(h => {
      const hora = parseInt(h.valor)
      const minuto = h.display.includes(':30') ? 30 : 0
      return hora > horaActual || (hora === horaActual && minuto > minutoActual)
    })
  }

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
    const newFieldErrors = {}
    if (!mesaSeleccionada) newFieldErrors.mesa = 'Selecciona una mesa'
    if (!fecha) newFieldErrors.fecha = 'Selecciona una fecha'
    if (!hora) newFieldErrors.hora = 'Selecciona una hora'
    if (numPersonas > mesaSeleccionada?.capacidad) newFieldErrors.personas = `La mesa solo tiene capacidad para ${mesaSeleccionada.capacidad} personas`
    if (!nombre.trim()) newFieldErrors.nombre = 'Ingresa tu nombre'
    if (!telefono.trim()) newFieldErrors.telefono = 'Ingresa tu teléfono'
    if (!email.trim() || !email.includes('@')) newFieldErrors.email = 'Ingresa un correo válido'
    
    setFieldErrors(newFieldErrors)
    return Object.keys(newFieldErrors).length === 0
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
          <div className="card" style={{backgroundColor: '#16213e'}}>
            <div className="card-header">
              <h2 className="card-title" style={{color: '#fff'}}>1. Selecciona tu Mesa</h2>
            </div>
            <div className="legend mb-2">
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#2a9d8f' }}></div>
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#e63946' }}></div>
                <span>Ocupada</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ background: '#888' }}></div>
                <span>Bloqueada</span>
              </div>
            </div>
            <div className="mesa-grid">
              {getMesasConEstado().map(mesa => (
                <div
                  key={mesa.id}
                  className={`mesa-item mesa-${mesa.estado} ${mesaSeleccionada?.id === mesa.id ? 'selected' : ''}`}
                  onClick={() => handleSeleccionarMesa(mesa)}
                  style={{ 
                    padding: '0.5rem', 
                    textAlign: 'center',
                    cursor: mesa.estado === 'disponible' ? 'pointer' : 'not-allowed',
                    opacity: mesa.estado === 'disponible' ? 1 : 0.6
                  }}
                >
                  {mesa.foto ? (
                    <img src={mesa.foto} alt={`Mesa ${mesa.numero}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />
                  ) : (
                    <div style={{ width: '100%', height: '80px', background: '#0f3460', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🪑</div>
                  )}
                  <div className="mesa-numero" style={{ fontWeight: 'bold', color: '#fff' }}>Mesa {mesa.numero}</div>
                  <div className="mesa-capacidad" style={{ fontSize: '0.875rem', color: '#aaa' }}>Cap: {mesa.capacidad}</div>
                  {mesa.estado !== 'disponible' && (
                    <div style={{ fontSize: '0.75rem', color: mesa.estado === 'bloqueada' ? '#888' : '#e63946', marginTop: '0.25rem' }}>
                      {mesa.estado === 'bloqueada' ? 'Bloqueada' : 'No disponible'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {fieldErrors.mesa && <div style={{ color: '#e63946', fontSize: '0.875rem', marginTop: '0.5rem', textAlign: 'center' }}>{fieldErrors.mesa}</div>}
          </div>

          <div className="card" style={{backgroundColor: '#16213e'}}>
            <div className="card-header">
              <h2 className="card-title" style={{color: '#fff'}}>2. Completa tu Reserva</h2>
              {fieldErrors.fecha && <div style={{ color: '#e63946', fontSize: '0.875rem', marginTop: '0.5rem' }}>{fieldErrors.fecha}</div>}
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
                  style={{ borderColor: fieldErrors.hora ? '#e63946' : '' }}
                  value={hora}
                  onChange={(e) => { setHora(e.target.value); setFieldErrors({...fieldErrors, hora: ''}) }}
                >
                  <option value="">Selecciona hora</option>
                  {horasDisponibles.map(h => (
                    <option key={h.valor} value={h.valor}>{h.display}</option>
                  ))}
                </select>
                {fieldErrors.hora && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>{fieldErrors.hora}</span>}
              </div>
            )}

            {fecha && horasDisponibles.length === 0 && (
              <div className="alert alert-warning mb-2">
                No hay horarios disponibles para este día
              </div>
            )}

<div className="form-group">
              <label className="form-label">Número de Personas *</label>
              <select
                className="form-select"
                style={{ borderColor: fieldErrors.personas ? '#e63946' : '' }}
                value={numPersonas}
                onChange={(e) => { setNumPersonas(parseInt(e.target.value)); setFieldErrors({...fieldErrors, personas: ''}) }}
                required
              >
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                ))}
              </select>
              {fieldErrors.personas && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>{fieldErrors.personas}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="form-input"
                style={{ borderColor: fieldErrors.nombre ? '#e63946' : '' }}
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setFieldErrors({...fieldErrors, nombre: ''}) }}
                placeholder="Tu nombre completo"
                required
              />
              {fieldErrors.nombre && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>{fieldErrors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono *</label>
              <input
                type="number"
                inputMode="numeric"
                className="form-input"
                style={{ borderColor: fieldErrors.telefono ? '#e63946' : '' }}
                value={telefono}
                onChange={(e) => { setTelefono(e.target.value.replace(/\D/g, '')); setFieldErrors({...fieldErrors, telefono: ''}) }}
                placeholder="Tu número de teléfono"
                required
              />
              {fieldErrors.telefono && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>{fieldErrors.telefono}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico *</label>
              <input
                type="email"
                className="form-input"
                style={{ borderColor: fieldErrors.email ? '#e63946' : '' }}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors({...fieldErrors, email: ''}) }}
                placeholder="tu@email.com"
                required
              />
              {fieldErrors.email && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>{fieldErrors.email}</span>}
            </div>

            {(error || Object.values(fieldErrors).some(e => e)) && (
              <div className="alert alert-danger">
                {Object.values(fieldErrors).filter(e => e).join(', ')}
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleReservar}
              disabled={guardando}
            >
              {guardando ? 'Reservando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
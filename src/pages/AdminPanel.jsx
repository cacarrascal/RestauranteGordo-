import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { uploadImage } from '../services/supabase'

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function AdminPanel() {
  const { mesas, reservas, horarios, addMesa, updateMesa, deleteMesa, addReserva, cancelReserva, addHorario, updateHorario, deleteHorario } = useApp()
  const [ tabActivo, setTabActivo] = useState('mesas')
  const [mostrarModalMesa, setMostrarModalMesa] = useState(false)
  const [mostrarModalHorario, setMostrarModalHorario] = useState(false)
  const [mostrarModalConfirm, setMostrarModalConfirm] = useState(false)
  const [itemAEliminar, setItemAEliminar] = useState(null)
  const [tipoEliminacion, setTipoEliminacion] = useState('')
  const [mesaEditando, setMesaEditando] = useState(null)
  const [horarioEditando, setHorarioEditando] = useState(null)
  const [error, setError] = useState('')

  const adminStyle = {
    minHeight: '100vh',
    backgroundColor: '#1a1a2e',
    padding: '2rem 0',
    display: 'flex',
    flexDirection: 'column'
  }

  const cardStyle = {
    backgroundColor: '#16213e',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  }

  const [formMesa, setFormMesa] = useState({ numero: '', capacidad: '', ubicacion: '', foto: '' })
  const [formHorario, setFormHorario] = useState({ dia_semana: 1, hora_inicio: '12', hora_fin: '21', activo: true })
  const [errors, setErrors] = useState({})

  const resetFormMesa = () => {
    setFormMesa({ numero: '', capacidad: '', ubicacion: '', foto: '' })
    setMesaEditando(null)
    setErrors({})
  }

  const resetFormHorario = () => {
    setFormHorario({ dia_semana: 1, hora_inicio: '12', hora_fin: '21', activo: true })
    setHorarioEditando(null)
  }

  const handleGuardarMesa = async () => {
    setError('')
    const newErrors = {}
    if (!formMesa.numero) newErrors.numero = true
    if (!formMesa.capacidad) newErrors.capacidad = true
    if (!formMesa.ubicacion || !formMesa.ubicacion.trim()) newErrors.ubicacion = true
    if (!formMesa.foto || (typeof formMesa.foto !== 'string' && !formMesa.foto.name)) newErrors.foto = true
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setError('Los campos requeridos deben completarse')
      return
    }
    setErrors({})
    try {
      let fotoUrl = null
      
      if (formMesa.foto && typeof formMesa.foto !== 'string') {
        fotoUrl = await uploadImage(formMesa.foto)
      } else if (typeof formMesa.foto === 'string') {
        fotoUrl = formMesa.foto
      }
      
      const mesaData = {
        numero: parseInt(formMesa.numero),
        capacidad: parseInt(formMesa.capacidad),
        ubicacion: formMesa.ubicacion,
        foto: fotoUrl
      }
      if (mesaEditando) {
        await updateMesa(mesaEditando.id, mesaData)
      } else {
        await addMesa({
          ...mesaData,
          estado: 'disponible'
        })
      }
      setMostrarModalMesa(false)
      resetFormMesa()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditarMesa = (mesa) => {
    setFormMesa({
      numero: mesa.numero.toString(),
      capacidad: mesa.capacidad.toString(),
      ubicacion: mesa.ubicacion || '',
      foto: mesa.foto || ''
    })
    setMesaEditando(mesa)
    setMostrarModalMesa(true)
  }

  const handleEliminarMesa = async () => {
    try {
      await deleteMesa(itemAEliminar.id)
      setMostrarModalConfirm(false)
      setItemAEliminar(null)
    } catch (err) {
      setError(err.message)
      setMostrarModalConfirm(false)
    }
  }

  const confirmarEliminarMesa = (mesa) => {
    setItemAEliminar(mesa)
    setTipoEliminacion('mesa')
    setMostrarModalConfirm(true)
  }

  const handleToggleBloqueo = async (mesa) => {
    try {
      setError('')
      const nuevoEstado = (mesa.estado === 'bloqueada' || !mesa.estado) ? 'disponible' : 'bloqueada'
      await updateMesa(mesa.id, { estado: nuevoEstado })
    } catch (err) {
      setError('Error al cambiar estado de la mesa: ' + err.message)
    }
  }

  const handleGuardarHorario = async () => {
    setError('')
    try {
      if (horarioEditando) {
        await updateHorario(horarioEditando.id, {
          dia_semana: parseInt(formHorario.dia_semana),
          hora_inicio: formHorario.hora_inicio,
          hora_fin: formHorario.hora_fin,
          activo: formHorario.activo
        })
      } else {
        await addHorario({
          dia_semana: parseInt(formHorario.dia_semana),
          hora_inicio: formHorario.hora_inicio,
          hora_fin: formHorario.hora_fin,
          activo: formHorario.activo
        })
      }
      setMostrarModalHorario(false)
      resetFormHorario()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditarHorario = (horario) => {
    setFormHorario({
      dia_semana: horario.dia_semana.toString(),
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      activo: horario.activo
    })
    setHorarioEditando(horario)
    setMostrarModalHorario(true)
  }

  const handleEliminarHorario = async (horario) => {
    if (confirm(`¿Eliminar horario del ${DIAS_SEMANA[horario.dia_semana]}?`)) {
      try {
        await deleteHorario(horario.id)
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleToggleHorario = async (horario) => {
    await updateHorario(horario.id, { activo: !horario.activo })
  }

  const handleCancelarReserva = async (reserva) => {
    if (confirm('¿Cancelar esta reserva?')) {
      try {
        await cancelReserva(reserva.id)
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const reservasActivas = reservas.filter(r => r.estado === 'confirmada')
  const reservasHoy = reservasActivas.filter(r => r.fecha === new Date().toISOString().split('T')[0])

  return (
    <div style={adminStyle}>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title" style={{ color: '#fff' }}>Panel de Administración</h1>
          <p className="page-subtitle" style={{ color: '#aaa' }}>Gestiona mesas, reservas y horarios</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={cardStyle}>
            <div className="stat-value" style={{ color: '#e63946' }}>{mesas.length}</div>
            <div className="stat-label" style={{ color: '#aaa' }}>Mesas Totales</div>
          </div>
          <div className="stat-card" style={cardStyle}>
            <div className="stat-value" style={{ color: '#2a9d8f' }}>{mesas.filter(m => m && m.estado === 'disponible').length}</div>
            <div className="stat-label" style={{ color: '#aaa' }}>Disponibles</div>
          </div>
          <div className="stat-card" style={cardStyle}>
            <div className="stat-value" style={{ color: '#f4a261' }}>{reservasActivas.length}</div>
            <div className="stat-label" style={{ color: '#aaa' }}>Reservas Activas</div>
          </div>
          <div className="stat-card" style={cardStyle}>
            <div className="stat-value" style={{ color: '#457b9d' }}>{reservasHoy.length}</div>
            <div className="stat-label" style={{ color: '#aaa' }}>Reservas Hoy</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #0f3460', paddingBottom: '0.5rem' }}>
          <button 
            onClick={() => setTabActivo('mesas')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: tabActivo === 'mesas' ? '#e63946' : 'transparent', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            Mesas
          </button>
          <button 
            onClick={() => setTabActivo('reservas')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: tabActivo === 'reservas' ? '#e63946' : 'transparent', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            Reservas
          </button>
          <button 
            onClick={() => setTabActivo('horarios')}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: tabActivo === 'horarios' ? '#e63946' : 'transparent', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            Horarios
          </button>
        </div>

        {tabActivo === 'mesas' && (
          <div className="card" style={cardStyle}>
            <div className="card-header flex justify-between items-center" style={{ borderBottom: '1px solid #333' }}>
              <h2 className="card-title" style={{ color: '#fff' }}>Gestión de Mesas</h2>
              <button className="btn btn-primary" onClick={() => { resetFormMesa(); setMostrarModalMesa(true); }}>
                + Nueva Mesa
              </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-container">
              <table className="table" style={{ color: '#fff' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f3460' }}>
                    <th style={{ color: '#fff' }}>Número</th>
                    <th style={{ color: '#fff' }}>Capacidad</th>
                    <th style={{ color: '#fff' }}>Ubicación</th>
                    <th style={{ color: '#fff' }}>Estado</th>
                    <th style={{ color: '#fff' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mesas.filter(m => m && m.id).map(mesa => (
                    <tr key={mesa.id}>
                      <td>Mesa {mesa.numero}</td>
                      <td>{mesa.capacidad} personas</td>
                      <td>{mesa.ubicacion || '-'}</td>
                      <td>
                        <span className={`badge ${mesa.estado === 'disponible' ? 'badge-success' : mesa.estado === 'bloqueada' ? 'badge-warning' : 'badge-danger'}`}>
                          {(mesa.estado === 'disponible' || !mesa.estado) ? 'Activa' : mesa.estado === 'bloqueada' ? 'Inactiva' : mesa.estado}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-sm btn-outline" onClick={() => handleToggleBloqueo(mesa)}>
                            {(mesa.estado === 'bloqueada' || !mesa.estado) ? 'Activar' : 'Desactivar'}
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleEditarMesa(mesa)}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => confirmarEliminarMesa(mesa)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {mesas.length === 0 && (
                <div className="empty-state" style={{ color: '#888' }}>
                  <div className="empty-icon">🪑</div>
                  <p>No hay mesas registradas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tabActivo === 'reservas' && (
          <div className="card" style={cardStyle}>
            <div className="card-header" style={{ borderBottom: '1px solid #333' }}>
              <h2 className="card-title" style={{ color: '#fff' }}>Historial de Reservas</h2>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-container">
              <table className="table" style={{ color: '#fff' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f3460' }}>
                    <th style={{ color: '#fff' }}>Mesa</th>
                    <th style={{ color: '#fff' }}>Cliente</th>
                    <th style={{ color: '#fff' }}>Fecha</th>
                    <th style={{ color: '#fff' }}>Hora</th>
                    <th style={{ color: '#fff' }}>Personas</th>
                    <th style={{ color: '#fff' }}>Estado</th>
                    <th style={{ color: '#fff' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.filter(r => r && r.id).map(reserva => {
                    const mesa = mesas.find(m => m && m.id === reserva.mesa_id)
                    return (
                      <tr key={reserva.id}>
                        <td>Mesa {mesa?.numero || reserva.mesa_id}</td>
                        <td>
                          <div>{reserva.cliente_nombre}</div>
                          <div style={{ fontSize: '0.875rem', color: '#888' }}>{reserva.cliente_email}</div>
                          <div style={{ fontSize: '0.875rem', color: '#888' }}>{reserva.cliente_tel}</div>
                        </td>
                        <td>{reserva.fecha}</td>
                        <td>{reserva.hora}</td>
                        <td>{reserva.num_personas}</td>
                        <td>
                          <span className={`badge ${reserva.estado === 'confirmada' ? 'badge-success' : 'badge-danger'}`}>
                            {reserva.estado}
                          </span>
                        </td>
                        <td>
                          {reserva.estado === 'confirmada' && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleCancelarReserva(reserva)}>
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {reservas.length === 0 && (
                <div className="empty-state" style={{ color: '#888' }}>
                  <div className="empty-icon">📅</div>
                  <p>No hay reservas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tabActivo === 'horarios' && (
          <div className="card" style={cardStyle}>
            <div className="card-header flex justify-between items-center" style={{ borderBottom: '1px solid #333' }}>
              <h2 className="card-title" style={{ color: '#fff' }}>Gestión de Horarios</h2>
              <button className="btn btn-primary" onClick={() => { resetFormHorario(); setMostrarModalHorario(true); }}>
                + Nuevo Horario
              </button>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="table-container">
              <table className="table" style={{ color: '#fff' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f3460' }}>
                    <th style={{ color: '#fff' }}>Día</th>
                    <th style={{ color: '#fff' }}>Inicio</th>
                    <th style={{ color: '#fff' }}>Fin</th>
                    <th style={{ color: '#fff' }}>Estado</th>
                    <th style={{ color: '#fff' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.filter(h => h && h.id).map(horario => (
                    <tr key={horario.id}>
                      <td>{DIAS_SEMANA[horario.dia_semana]}</td>
                      <td>{horario.hora_inicio}:00</td>
                      <td>{horario.hora_fin}:00</td>
                      <td>
                        <span className={`badge ${horario.activo ? 'badge-success' : 'badge-danger'}`}>
                          {horario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-sm btn-outline" onClick={() => handleToggleHorario(horario)}>
                            {horario.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleEditarHorario(horario)}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleEliminarHorario(horario)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {horarios.length === 0 && (
                <div className="empty-state" style={{ color: '#888' }}>
                  <div className="empty-icon">🕐</div>
                  <p>No hay horarios registrados</p>
                </div>
              )}
            </div>
          </div>
        )}

        {mostrarModalMesa && (
<div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.8)' }} onClick={() => setMostrarModalMesa(false)}>
          <div className="modal" style={{ backgroundColor: '#16213e', color: '#fff' }} onClick={(e) => e.stopPropagation()}>
<div className="modal-header" style={{ borderBottom: '1px solid #333' }}>
              <h3 className="modal-title" style={{ color: '#fff' }}>{mesaEditando ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
              <button className="modal-close" style={{ color: '#fff' }} onClick={() => setMostrarModalMesa(false)}>&times;</button>
            </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Número de Mesa *</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ borderColor: errors.numero ? '#e63946' : '' }}
                    value={formMesa.numero}
                    onChange={(e) => { setFormMesa({ ...formMesa, numero: e.target.value }); setErrors({ ...errors, numero: false }) }}
                    min="1"
                  />
                  {errors.numero && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>Requerido</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Capacidad *</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ borderColor: errors.capacidad ? '#e63946' : '' }}
                    value={formMesa.capacidad}
                    onChange={(e) => { setFormMesa({ ...formMesa, capacidad: e.target.value }); setErrors({ ...errors, capacidad: false }) }}
                    min="1"
                    max="20"
                  />
                  {errors.capacidad && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>Requerido</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Ubicación *</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ borderColor: errors.ubicacion ? '#e63946' : '' }}
                    value={formMesa.ubicacion}
                    onChange={(e) => { setFormMesa({ ...formMesa, ubicacion: e.target.value }); setErrors({ ...errors, ubicacion: false }) }}
                    placeholder="ej: Terraza, Interior"
                  />
                  {errors.ubicacion && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>Requerido</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Foto de la Mesa *</label>
                  <input
                    type="file"
                    className="form-input"
                    style={{ borderColor: errors.foto ? '#e63946' : '' }}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setFormMesa({ ...formMesa, foto: file })
                        setErrors({ ...errors, foto: false })
                      }
                    }}
                  />
                  {errors.foto && <span style={{ color: '#e63946', fontSize: '0.75rem' }}>Requerida</span>}
                  {formMesa.foto && typeof formMesa.foto !== 'string' && (
                    <div style={{ marginTop: '0.5rem', color: '#2a9d8f' }}>
                      ✓ {formMesa.foto.name}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setMostrarModalMesa(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleGuardarMesa}>
                  {mesaEditando ? 'Guardar Cambios' : 'Crear Mesa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarModalHorario && (
<div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.8)' }} onClick={() => setMostrarModalHorario(false)}>
          <div className="modal" style={{ backgroundColor: '#16213e', color: '#fff' }} onClick={(e) => e.stopPropagation()}>
<div className="modal-header" style={{ borderBottom: '1px solid #333' }}>
              <h3 className="modal-title" style={{ color: '#fff' }}>{horarioEditando ? 'Editar Horario' : 'Nuevo Horario'}</h3>
              <button className="modal-close" style={{ color: '#fff' }} onClick={() => setMostrarModalHorario(false)}>&times;</button>
            </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Día de la Semana</label>
                  <select
                    className="form-select"
                    value={formHorario.dia_semana}
                    onChange={(e) => setFormHorario({ ...formHorario, dia_semana: e.target.value })}
                  >
                    {DIAS_SEMANA.map((dia, index) => (
                      <option key={index} value={index}>{dia}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Hora de Inicio</label>
                    <select
                      className="form-select"
                      value={formHorario.hora_inicio}
                      onChange={(e) => setFormHorario({ ...formHorario, hora_inicio: e.target.value })}
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 8).map(h => (
                        <option key={h} value={h}>{h}:00</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora de Fin</label>
                    <select
                      className="form-select"
                      value={formHorario.hora_fin}
                      onChange={(e) => setFormHorario({ ...formHorario, hora_fin: e.target.value })}
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 8).map(h => (
                        <option key={h} value={h}>{h}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={formHorario.activo}
                      onChange={(e) => setFormHorario({ ...formHorario, activo: e.target.checked })}
                    />
                    Horario activo
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setMostrarModalHorario(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleGuardarHorario}>
                  {horarioEditando ? 'Guardar Cambios' : 'Crear Horario'}
                </button>
              </div>
            </div>
          </div>
)}

        {mostrarModalConfirm && (
          <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setMostrarModalConfirm(false)}>
            <div style={{ backgroundColor: '#16213e', color: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗑️</div>
              <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Confirmar eliminación</h3>
              <p style={{ marginBottom: '1.5rem', color: '#aaa' }}>
                ¿Estás seguro de eliminar la mesa <strong style={{ color: '#e63946' }}>{itemAEliminar?.numero}</strong>?
              </p>
              <p style={{ fontSize: '0.875rem', color: '#f4a261', marginBottom: '1.5rem' }}>
                Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => setMostrarModalConfirm(false)} style={{ borderColor: '#aaa', color: '#aaa' }}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleEliminarMesa} style={{ background: '#e63946' }}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    )
  }
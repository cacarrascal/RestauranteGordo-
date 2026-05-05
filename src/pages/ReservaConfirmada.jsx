import { Link, useSearchParams } from 'react-router-dom'

const formatHora12h = (hora24) => {
  if (!hora24) return ''
  const h = parseInt(hora24)
  const period = h >= 12 ? 'pm' : 'am'
  const hour12 = h > 12 ? h - 12 : (h === 0 ? 12 : h)
  return `${hour12} ${period}`
}

export default function ReservaConfirmada() {
  const [searchParams] = useSearchParams()
  const mesa = searchParams.get('mesa') || ''
  const fecha = searchParams.get('fecha') || ''
  const hora = searchParams.get('hora') || ''
  const nombre = decodeURIComponent(searchParams.get('nombre') || '')

  return (
    <div className="page">
      <div className="hero">
        <div className="container">
          <div className="success-icon">✓</div>
          <h1 className="hero-title">Reserva Confirmada</h1>
          <p className="hero-subtitle">Gracias por confiar en nosotros</p>
        </div>
      </div>

      <div className="container">
        <div className="card" style={{ maxWidth: '500px', margin: '-3rem auto 0', backgroundColor: '#16213e' }}>
          <div className="card-header">
            <h2 className="card-title text-center" style={{color: '#fff'}}>Detalles de tu Reserva</h2>
          </div>
          
          <div className="p-2">
            <div className="form-group">
              <label className="form-label">Cliente</label>
              <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fff' }}>{nombre}</p>
            </div>
            
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Mesa</label>
                <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fff' }}>{mesa}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fff' }}>{fecha ? new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</p>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Hora</label>
              <p style={{ fontSize: '1.125rem', fontWeight: '500', color: '#fff' }}>{formatHora12h(hora)}</p>
            </div>
          </div>

          <div className="alert alert-success mt-2">
            <p><strong>Importante:</strong> Te recomendamos llegar 10 minutos antes de tu hora reservada.</p>
          </div>

          <div className="text-center mt-2">
            <Link to="/" className="btn btn-primary">
              Hacer otra reserva
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
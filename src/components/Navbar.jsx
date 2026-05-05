import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo">
          <img src="/imagenes.jpg" alt="The Gordo" style={{ height: '50px' }} />
        </Link>
        <div className="nav-links">
          <Link to="/">Reservar</Link>
          {user ? (
            <>
              <Link to="/admin">Panel</Link>
              <button className="btn btn-sm btn-outline" onClick={handleSignOut}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/login">Admin</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
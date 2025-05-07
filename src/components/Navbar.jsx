import { Link } from 'react-router-dom'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut(auth)
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-semibold">
          Book Me
        </Link>
        <Link to="/availability">Availability</Link>
        <Link to="/booking">Booking</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hover:bg-red-500 px-3 py-2 rounded"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded">
                Log In
              </Link>
              <Link to="/signup" className="hover:bg-blue-700 px-3 py-2 rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

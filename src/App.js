import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Availability from './pages/Availability'
import Booking from './pages/Booking'
import { Toaster } from 'react-hot-toast'

function App() {
  const [user, setUser] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null)
    })
    return () => unsub()
  }, [])

  // Check if the route is login or signup to hide Navbar
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      {!hideNavbar && <Navbar user={user} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/availability" element={<Availability user={user} />} />
        <Route path="/booking" element={<Booking user={user} />} />
      </Routes>
    </div>
  )
}

export default App

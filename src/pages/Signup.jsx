import { useState } from 'react'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Save user data including name to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: name.trim(), // Save name
        availability: {},
      })

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Failed to create an account. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 mb-3 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 mb-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 mb-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 bg-blue-600 text-white rounded ${loading ? 'opacity-50' : 'hover:bg-blue-700'}`}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Log In
          </a>
        </p>
      </div>
    </div>
  )
}

export default Signup

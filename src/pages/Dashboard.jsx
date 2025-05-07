import "../index.css"
import { useEffect, useState } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'

const Dashboard = () => {
    const [user, setUser] = useState(null)
    const [services, setServices] = useState([]) // State to store services
    const [serviceName, setServiceName] = useState('')
    const [duration, setDuration] = useState('')
    const [price, setPrice] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                console.log('User signed in:', currentUser)
            } else {
                navigate('/login')
            }
        })
        return () => unsub()
    }, [navigate])

    // Fetch services from Firestore
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'services'))
                const servicesData = querySnapshot.docs.map(doc => doc.data())
                setServices(servicesData)
                console.log('Fetched services:', servicesData)
            } catch (err) {
                console.error('Error fetching services:', err)
            }
        }
        fetchServices()
    }, [])

    // Handle service form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!serviceName || !duration || !price) {
            setError('All fields are required')
            return
        }

        setError('')
        setLoading(true)

        try {
            await addDoc(collection(db, 'services'), {
                name: serviceName,
                duration: Number(duration),
                price: Number(price),
                createdAt: new Date(),
            })
            setServiceName('')
            setDuration('')
            setPrice('')
            // Re-fetch services after adding
            const querySnapshot = await getDocs(collection(db, 'services'))
            const servicesData = querySnapshot.docs.map(doc => doc.data())
            setServices(servicesData)
            console.log('Added new service, updated services:', servicesData)
        } catch (err) {
            setError('Failed to add service')
            console.error('Error adding service:', err)
        }

        setLoading(false)
    }

    // Handle log out
    const handleLogout = () => {
        signOut(auth)
        navigate('/login')
    }

    if (!user) return null

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl font-semibold mb-2">Welcome, {user.email}</h1>
            <button
                onClick={handleLogout}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
                Log Out
            </button>

            <div className="mt-10 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Create a New Service</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Service Name"
                        className="w-full px-4 py-2 mb-3 border rounded"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Duration (in minutes)"
                        className="w-full px-4 py-2 mb-3 border rounded"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        className="w-full px-4 py-2 mb-3 border rounded"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 bg-blue-600 text-white rounded ${loading ? 'opacity-50' : 'hover:bg-blue-700'}`}
                    >
                        {loading ? 'Adding...' : 'Add Service'}
                    </button>
                </form>
            </div>

            <div className="mt-10 w-full max-w-4xl">
                <h2 className="text-xl font-semibold mb-4">Your Services</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, index) => (
                        <div key={index} className="p-6 bg-white rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold">{service.name}</h3>
                            <p className="text-gray-600">Duration: {service.duration} mins</p>
                            <p className="text-gray-600">Price: ${service.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard

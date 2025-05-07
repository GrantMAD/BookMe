import "../index.css";
import { useState } from 'react'
import { db } from '../firebase/firebase'
import { addDoc, collection } from 'firebase/firestore'

const ServiceForm = () => {
    const [serviceName, setServiceName] = useState('')
    const [duration, setDuration] = useState('')
    const [price, setPrice] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
  
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
      } catch (err) {
        setError('Failed to add service')
      }
  
      setLoading(false)
    }
  
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Create a New Service</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Service Name"
            className="w-full px-4 py-2 mb-3 border rounded"
          />
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration (in minutes)"
            className="w-full px-4 py-2 mb-3 border rounded"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="w-full px-4 py-2 mb-3 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 bg-blue-600 text-white rounded ${
              loading ? 'opacity-50' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Adding...' : 'Add Service'}
          </button>
        </form>
      </div>
    )
  }
export default ServiceForm; 
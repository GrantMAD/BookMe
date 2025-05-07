import { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import toast from 'react-hot-toast'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const Availability = () => {
  const [user] = useAuthState(auth)
  const [availability, setAvailability] = useState({})
  const [newSlot, setNewSlot] = useState({ day: '', time: '' })

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setAvailability(docSnap.data().availability || {})
      }
    }
    fetchAvailability()
  }, [user])

  const handleAddSlot = () => {
    if (!newSlot.day || !newSlot.time) return
  
    setAvailability(prev => {
      const updated = { ...prev }
      if (!updated[newSlot.day]) updated[newSlot.day] = []
      if (!updated[newSlot.day].includes(newSlot.time)) {
        updated[newSlot.day].push(newSlot.time)
      }
      return updated
    })
  
    setNewSlot({ day: '', time: '' })
  }    

  const handleSave = async () => {
    if (!user) {
      console.error('User not authenticated')
      return
    }
  
    const userRef = doc(db, 'users', user.uid)
  
    try {
      console.log('Saving availability:', availability)
  
      await setDoc(userRef, { availability }, { merge: true })
  
      toast.success('Availability saved!')
    } catch (error) {
      console.error('Error saving availability:', error)
      toast.error('Failed to save availability.')
    }
  }
  

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Manage Availability</h2>

      <div className="flex gap-2 mb-4">
        <select
          className="border px-3 py-2 rounded w-1/2"
          value={newSlot.day}
          onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
        >
          <option value="">Select Day</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="e.g. 10:00 AM"
          className="border px-3 py-2 rounded w-1/2"
          value={newSlot.time}
          onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
        />
      </div>

      <button
        onClick={handleAddSlot}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Slot
      </button>

      {Object.entries(availability).map(([day, slots]) => (
        <div key={day} className="mb-4">
          <h3 className="capitalize font-semibold">{day}</h3>
          <div className="flex flex-wrap gap-2">
            {slots.map((time, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-200 rounded-full text-sm"
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save Availability
      </button>
    </div>
  )
}

export default Availability

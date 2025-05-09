import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import toast from 'react-hot-toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const Availability = () => {
  const [user] = useAuthState(auth);
  const [availability, setAvailability] = useState({});
  const [newSlot, setNewSlot] = useState({ day: '', time: '' });
  const [temporarySlots, setTemporarySlots] = useState([]);

  const [service, setService] = useState('');
  const [location, setLocation] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('in-person');
  const [tags, setTags] = useState('');
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState('');
  const [bufferTime, setBufferTime] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAvailability(data.availability || {});
        setService(data.service || '');
        setLocation(data.location || '');
        setRate(data.rate || '');
        setDuration(data.duration || '');
        setNotes(data.notes || '');
        setMode(data.mode || 'in-person');
        setTags(data.tags || '');
        setMaxBookingsPerDay(data.maxBookingsPerDay || '');
        setBufferTime(data.bufferTime || '');
      }
    };
    fetchAvailability();
  }, [user]);

  const handleAddSlot = () => {
    const { day, time } = newSlot;
    if (!day || !time) return;
    setTemporarySlots((prev) => [...prev, { day, time }]);
    setNewSlot({ day: '', time: '' });
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const updatedAvailability = { ...availability };

      temporarySlots.forEach(({ day, time }) => {
        if (!updatedAvailability[day]) updatedAvailability[day] = [];
        if (!updatedAvailability[day].includes(time)) {
          updatedAvailability[day].push(time);
        }
      });

      await setDoc(
        doc(db, 'users', user.uid),
        {
          availability: updatedAvailability,
          service,
          location,
          rate,
          duration,
          notes,
          mode,
          tags,
          maxBookingsPerDay,
          bufferTime,
        },
        { merge: true }
      );

      toast.success('Availability saved!');
      setAvailability(updatedAvailability);
      setTemporarySlots([]);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability.');
    }
  };

  const handleDeleteSavedSlot = async (day, time) => {
    if (!user) return;
    try {
      const updatedAvailability = { ...availability };
      updatedAvailability[day] = updatedAvailability[day].filter((t) => t !== time);
      if (updatedAvailability[day].length === 0) delete updatedAvailability[day];

      await setDoc(doc(db, 'users', user.uid), {
        availability: updatedAvailability,
      }, { merge: true });

      setAvailability(updatedAvailability);
      toast.success('Time removed.');
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete time.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 mb-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Manage Availability</h2>

      {/* Service fields */}
      <div className="space-y-2 mb-4">
        <input type="text" placeholder="What service are you offering?" className="border px-3 py-2 rounded w-full" value={service} onChange={(e) => setService(e.target.value)} />
        <input type="text" placeholder="Location" className="border px-3 py-2 rounded w-full" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input type="text" placeholder="Price or Rate (e.g. $50/hour)" className="border px-3 py-2 rounded w-full" value={rate} onChange={(e) => setRate(e.target.value)} />
        <input type="text" placeholder="Session Duration (e.g. 1 hour)" className="border px-3 py-2 rounded w-full" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <textarea placeholder="Notes (e.g. availability exceptions or preferences)" className="border px-3 py-2 rounded w-full" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <select className="border px-3 py-2 rounded w-full" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="in-person">In-Person</option>
          <option value="online">Online</option>
          <option value="both">Both</option>
        </select>
        <input type="text" placeholder="Tags / Specializations" className="border px-3 py-2 rounded w-full" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="number" placeholder="Max Bookings Per Day" className="border px-3 py-2 rounded w-full" value={maxBookingsPerDay} onChange={(e) => setMaxBookingsPerDay(e.target.value)} />
        <input type="text" placeholder="Buffer Time Between Bookings" className="border px-3 py-2 rounded w-full" value={bufferTime} onChange={(e) => setBufferTime(e.target.value)} />
      </div>

      {/* Time slot input */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <select className="border px-3 py-2 rounded w-1/2" value={newSlot.day} onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}>
            <option value="">Select Day</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. 10:00"
            className="border px-3 py-2 rounded w-1/2"
            value={newSlot.time}
            onChange={(e) => {
              let val = e.target.value;
              if (/^\d{2}$/.test(val)) val = val + ':';
              setNewSlot({ ...newSlot, time: val });
            }}
          />
        </div>
        <button onClick={handleAddSlot} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Slot</button>
      </div>

      {/* Temporary slots display */}
      {temporarySlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">New Slots (not saved yet):</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {temporarySlots.map(({ day, time }, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                  {`${day.charAt(0).toUpperCase() + day.slice(1)} - ${time}`}
                </span>
                <button onClick={() => setTemporarySlots((prev) => prev.filter((s, idx) => idx !== i))} className="text-red-600 hover:text-red-800">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved availability slots */}
      <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save Availability</button>

      <div className="mb-4 mt-5">
        <h3 className="text-lg font-semibold">Saved Availability:</h3>
        {Object.entries(availability).map(([day, slots]) => (
          <div key={day} className="mb-2">
            <h4 className="capitalize font-medium">{day}</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {slots.map((time, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-200 rounded-full text-sm">{time}</span>
                  <button onClick={() => handleDeleteSavedSlot(day, time)} className="text-red-600 hover:text-red-800">✕</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Availability;

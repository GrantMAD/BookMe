import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  setDoc
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faMapMarkerAlt,
  faDollarSign,
  faClock,
  faStickyNote,
  faLaptop,
  faTags,
  faCalendarDay,
  faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons';

import toast from 'react-hot-toast';

const Booking = () => {
  const [user] = useAuthState(auth);
  const [service, setService] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [availability, setAvailability] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);

  const [location, setLocation] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('');
  const [tags, setTags] = useState([]);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState('');
  const [bufferTime, setBufferTime] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== user?.uid);

      setAllUsers(users);
      if (users.length > 0) {
        setTargetUserId(users[0].uid);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!targetUserId) return;

      const docRef = doc(db, 'users', targetUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setAvailability(data.availability || {});
        setService(data.service || '');
        setLocation(data.location || '');
        setRate(data.rate || '');
        setDuration(data.duration || '');
        setNotes(data.notes || '');
        setMode(data.mode || '');
        setTags(Array.isArray(data.tags) ? data.tags : typeof data.tags === 'string' ? [data.tags] : []);
        setMaxBookingsPerDay(data.maxBookingsPerDay || '');
        setBufferTime(data.bufferTime || '');
      }
    };

    fetchUserDetails();
  }, [targetUserId]);

  useEffect(() => {
    const fetchReceivedBookings = async () => {
      if (!user) return;

      const bookingsSnapshot = await getDocs(
        collection(db, 'users', user.uid, 'receivedBookings')
      );
      const bookings = await Promise.all(
        bookingsSnapshot.docs.map(async (docSnap) => {
          const booking = { id: docSnap.id, ...docSnap.data() };
          const fromUserRef = doc(db, 'users', booking.fromUser);
          const fromUserSnap = await getDoc(fromUserRef);

          return {
            ...booking,
            fromUserName: fromUserSnap.exists() ? fromUserSnap.data().name || 'Unknown' : 'Unknown',
            createdAt: booking.createdAt?.toDate(),
          };
        })
      );

      setReceivedBookings(bookings);
    };

    fetchReceivedBookings();
  }, [user]);

  const isSlotSelected = (day, time) => {
    return selectedSlots.some(slot => slot.day === day && slot.time === time);
  };

  const handleSlotSelection = (day, time) => {
    const slot = { day, time };
    if (isSlotSelected(day, time)) {
      setSelectedSlots(selectedSlots.filter(s => s.day !== day || s.time !== time));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleBooking = async () => {
    if (!user || selectedSlots.length === 0) return;

    try {
      for (const slot of selectedSlots) {
        const bookingRef = await addDoc(collection(db, 'bookings'), {
          fromUser: user.uid,
          toUser: targetUserId,
          day: slot.day,
          time: slot.time,
          createdAt: new Date(),
        });

        const bookingData = {
          fromUser: user.uid,
          toUser: targetUserId,
          day: slot.day,
          time: slot.time,
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', targetUserId, 'receivedBookings', bookingRef.id), bookingData);
      }

      toast.success('Booking successful!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to book slots');
    }
  };

  return (
    <div className="m-20 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 underline underline-offset-2">Book a Time Slot</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 m-6">
        {/* Sidebar (User + Info) */}
        <aside className="lg:col-span-1 bg-white shadow p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Select Provider</h2>
          <select
            className="w-full border px-3 py-2 rounded mb-4"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
          >
            {allUsers.map((u) => (
              <option key={u.uid} value={u.uid}>{u.name}</option>
            ))}
          </select>

          <div className="space-y-2 text-lg">
            <h1 className='text-xl mb-5 underline underline-offset-2'>
              User Information
            </h1>
            <div className='flex'>
              <div className='mr-20'>
                {service && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faBriefcase} className='text-blue-600' /><strong>Service:</strong> {service}</p>}
                {location && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faMapMarkerAlt} className='text-blue-600' /><strong>Location:</strong> {location}</p>}
                {rate && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faDollarSign} className='text-blue-600' /><strong>Rate:</strong> {rate}</p>}
                {duration && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faClock} className='text-blue-600' /><strong>Duration:</strong> {duration}</p>}
                {notes && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faStickyNote} className='text-blue-600' /><strong>Notes:</strong> {notes}</p>}
              </div>
              <div>
                {mode && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faLaptop} className='text-blue-600' /><strong>Mode:</strong> {mode}</p>}
                {tags.length > 0 && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faTags} className='text-blue-600' /><strong>Tags:</strong> {tags.join(', ')}</p>}
                {maxBookingsPerDay && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faCalendarDay} className='text-blue-600' /><strong>Max/Day:</strong> {maxBookingsPerDay}</p>}
                {bufferTime && <p className='flex items-center gap-2 mb-3'><FontAwesomeIcon icon={faHourglassHalf} className='text-blue-600' /><strong>Buffer:</strong> {bufferTime}</p>}
              </div>
            </div>

          </div>
        </aside>

        {/* Main Availability View */}
        <main className="lg:col-span-2 bg-white shadow p-6 rounded">
          <h2 className="text-xl font-semibold mb-4">Select Time Slots</h2>

          {Object.entries(availability).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(availability).map(([day, slots]) => (
                <div key={day} className="border p-4 rounded shadow-md">
                  <h3 className="text-lg font-medium mb-2 text-center capitalize p-2 rounded">{day}</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {slots.length > 0 ? (
                      slots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleSlotSelection(day, time)}
                          className={`px-4 py-2 rounded border text-sm transition-all ${isSlotSelected(day, time)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                          {time}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center">No slots available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No availability found</p>
          )}

          {selectedSlots.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-lg font-semibold mb-2">Selected Slots:</h4>

              <ul className="ml-4 space-y-2 text-sm">
                {Object.entries(
                  selectedSlots.reduce((acc, { day, time }) => {
                    acc[day] = acc[day] ? [...acc[day], time] : [time];
                    return acc;
                  }, {})
                ).map(([day, times]) => (
                  <li className="flex flex-col" key={day}>
                    <strong className="capitalize mb-1">{day}</strong>
                    <div className="flex flex-wrap gap-2">
                      {times.map((time, i) => (
                        <span
                          key={i}
                          className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleBooking}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Confirm Booking
              </button>
            </div>
          )}

        </main>


        {/* Received Bookings Section */}
        <section className="col-span-1 lg:col-span-3 bg-white shadow p-6 rounded">
          <h3 className="text-xl font-semibold mb-4">Received Bookings</h3>
          {receivedBookings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {receivedBookings.map((booking, index) => (
                <div key={index} className="p-4 border border-gray-300 rounded">
                  <p><strong>From:</strong> {booking.fromUserName}</p>
                  <p><strong>Day:</strong> {booking.day}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  <p><strong>Booked At:</strong> {booking.createdAt?.toLocaleString() || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No received bookings yet.</p>
          )}
        </section>
      </div>

    </div>
  );
};

export default Booking;

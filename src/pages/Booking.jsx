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
import toast from 'react-hot-toast';

const Booking = () => {
  const [user] = useAuthState(auth);
  const [service, setService] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [availability, setAvailability] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]); // State for multiple selected slots
  const [receivedBookings, setReceivedBookings] = useState([]); // State for received bookings

  // Fetch list of all users except current user
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = querySnapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(u => u.uid !== user?.uid);

      setAllUsers(users);

      // Set default selected user
      if (users.length > 0) {
        setTargetUserId(users[0].uid);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Fetch availability for the selected user
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!targetUserId) return;

      const docRef = doc(db, 'users', targetUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAvailability(docSnap.data().availability || {});
      } else {
        setAvailability({});
      }
    };

    fetchAvailability();
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

          // Fetch sender's name using fromUser UID
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

  useEffect(() => {
    const fetchService = async () => {
      if (!targetUserId) return;

      const docRef = doc(db, 'users', targetUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setService(docSnap.data().service || 'No service available');
      }
    };

    fetchService();
  }, [targetUserId]);

  // Function to check if a slot is already selected
  const isSlotSelected = (day, time) => {
    return selectedSlots.some(slot => slot.day === day && slot.time === time);
  };

  // Function to handle the selection of a time slot
  const handleSlotSelection = (day, time) => {
    const slot = { day, time };
    if (isSlotSelected(day, time)) {
      setSelectedSlots(selectedSlots.filter(s => s.day !== day || s.time !== time));  // Remove slot if it's already selected
    } else {
      setSelectedSlots([...selectedSlots, slot]);  // Add slot to selectedSlots
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!user || selectedSlots.length === 0) return;

    try {
      // Loop through selectedSlots and create a booking for each
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

        // Save the same booking to the target user's 'receivedBookings' subcollection
        await setDoc(doc(db, 'users', targetUserId, 'receivedBookings', bookingRef.id), bookingData);
      }

      toast.success('Booking successful!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to book slots');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Book a Time Slot</h2>

      {/* Select user to book with */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Select User to Book With:</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
        >
          {allUsers.map((u) => (
            <option key={u.uid} value={u.uid}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div key="availability" className="mb-6">
        {/* Display the service only once, above all available days */}
        {service && <p className="text-xl font-semibold mb-4">{service}</p>}

        {Object.entries(availability).length > 0 ? (
          Object.entries(availability).map(([day, slots]) => (
            <div key={day} className="mb-4">
              <h3 className="capitalize font-semibold mb-2">{day}</h3>
              <div className="flex flex-wrap gap-2">
                {slots.length > 0 ? (
                  slots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleSlotSelection(day, time)}  // Add or remove the slot from selectedSlots
                      className={`px-3 py-1 rounded border ${isSlotSelected(day, time)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                      {time}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">Currently no slots available</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Currently no slots available</p>
        )}
      </div>
      
      {/* Display selected slots */}
      {selectedSlots.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold">Selected Time Slots:</h4>
          <ul>
            {selectedSlots.map((slot, index) => (
              <li key={index}>
                {slot.day} - {slot.time}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm Booking Button */}
      <button
        onClick={handleBooking}
        disabled={selectedSlots.length === 0}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        Confirm Booking
      </button>

      {/* Display Received Bookings */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Received Bookings</h3>
        {receivedBookings.length > 0 ? (
          <div>
            {receivedBookings.map((booking, index) => (
              <div key={index} className="p-4 border border-gray-300 rounded mb-4">
                <p><strong>From:</strong> {booking.fromUserName}</p>
                <p><strong>Day:</strong> {booking.day}</p>
                <p><strong>Time:</strong> {booking.time}</p>
                <p><strong>Booked At:</strong> {booking.createdAt ? booking.createdAt.toLocaleString() : 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No received bookings yet.</p>
        )}
      </div>
    </div>
  );
};

export default Booking;

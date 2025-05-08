import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUser, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [userName, setUserName] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name);
        } else {
          console.log("No such document!");
        }
      };
      fetchUserData();
    }
  }, [user]);

  // Detect outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
        setTimeout(() => setDropdownVisible(false), 200);
      }
    };
    if (dropdownVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownVisible]);

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
      setTimeout(() => setDropdownVisible(false), 200);
    } else {
      setDropdownVisible(true);
      setTimeout(() => setIsDropdownOpen(true), 10);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setUserName(null);
    setIsDropdownOpen(false);
    setDropdownVisible(false);
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white text-black p-4 shadow-b shadow-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-semibold">Book Me</Link>

        <div className="md:hidden flex items-center">
          <button onClick={handleMenuToggle}>
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-white text-2xl" />
          </button>
        </div>

        <div className={`text-gray-500 order-3 w-full md:w-auto md:order-2 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="flex font-semibold justify-between text-sm">
            <li className="md:px-4 md:py-2 text-black m-3 hover:scale-125"><Link to="/">Home</Link></li>
            <li className="md:px-4 md:py-2 text-black m-3 hover:scale-125"><Link to="/availability">Availability</Link></li>
            <li className="md:px-4 md:py-2 text-black m-3 hover:scale-125"><Link to="/booking">Booking</Link></li>
            <li className="md:px-4 md:py-2 text-black m-3 hover:scale-125"><Link to="/about-us">About Us</Link></li>
            <li className="md:px-4 md:py-2 text-black m-3 hover:scale-125"><Link to="/contact-us">Contact Us</Link></li>
          </ul>
        </div>

        <div className="flex order-3 md:order-2">
          {!user ? (
            <>
              <Link to="/login">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-gray-50 rounded-xl flex items-center gap-2 mr-3">
                  <FontAwesomeIcon icon={faSignInAlt} className="h-5 w-5" />
                  <span>Login</span>
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-gray-50 rounded-xl flex items-center gap-2">
                  <FontAwesomeIcon icon={faSignInAlt} className="h-5 w-5" />
                  <span>SignUp</span>
                </button>
              </Link>
            </>
          ) : (
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center mr-2 hover:scale-125"
                onClick={toggleDropdown}
              >
                <FontAwesomeIcon icon={faUser} className="text-white text-lg" />
              </button>

              <div className="text-black text-sm font-semibold ml-2">
                <h1>Welcome,</h1>
                {userName || 'User'}
              </div>

              {dropdownVisible && (
                <ul
                  className={`absolute right-20 mt-2 bg-white shadow-lg rounded-lg w-40 p-2 transform transition-all duration-200 ease-in-out z-50
                    ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
                  `}
                >
                  <li className="w-full text-left py-2 px-4 text-blue-600 hover:bg-gray-200">
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li className="w-full text-left py-2 px-4 text-blue-600 hover:bg-gray-200" onClick={handleLogout}>
                    Logout
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

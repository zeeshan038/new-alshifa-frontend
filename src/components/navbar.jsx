import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Function to clear localStorage and logout
  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  // Set up 24-hour timer to clear localStorage
  useEffect(() => {
    const setupAutoLogout = () => {
      // Clear any existing timer
      const existingTimer = localStorage.getItem('autoLogoutTimer');
      if (existingTimer) {
        clearTimeout(parseInt(existingTimer));
      }

      // Set new 24-hour timer (24 * 60 * 60 * 1000 = 86400000 ms)
      const timer = setTimeout(() => {
        localStorage.clear();
        toast.error('Session expired after 24 hours. Please login again.');
        navigate('/login');
      }, 24 * 60 * 60 * 1000);

      // Store timer ID in localStorage for cleanup
      localStorage.setItem('autoLogoutTimer', timer.toString());

      return timer;
    };

    // Only set up timer if user is logged in (has token)
    const token = localStorage.getItem('token');
    if (token) {
      const timer = setupAutoLogout();
      
      // Cleanup function
      return () => {
        clearTimeout(timer);
        localStorage.removeItem('autoLogoutTimer');
      };
    }
  }, [navigate]);

  return (
    <nav className="bg-[#1a4b52] p-6 text-white flex justify-around items-center">
      <div className="flex items-center">
        {/* Placeholder for an icon. You can replace this with an actual icon library like Font Awesome or Material Icons. */}
        <span className="text-2xl mr-2">💊</span> 
        <span className="text-xl font-semibold">NEW AL-SHIFA</span>
      </div>
      <div className="relative">
        <span className="text-2xl cursor-pointer" onClick={toggleDropdown}>👤</span>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <Link to={'/dashboard'} className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100">Admin Panel</Link>
            <button 
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
            >
              Logout
            </button>

          </div>
        )}
      </div>
    </nav>
  )
}

export default navbar
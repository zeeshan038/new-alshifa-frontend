import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { BASE_URL } from '../constant';
import MedicineCardSkeleton from '../components/MedicineCardSkeleton';
import SearchBar from '../components/SearchBar';
import { Link } from 'react-router-dom';

const Home = () => {
  console.log("Home component rendered");
  const [medicines, setMedicines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 8; 

  const handleSearch = useCallback((term) => {
    setCurrentSearchTerm(term);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_URL}/api/medicine/get-all-med?page=${currentPage}&limit=${itemsPerPage}&name=${currentSearchTerm}`);
        setMedicines(response.data.medicines);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError(err);
        console.error("Error fetching medicines:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [currentPage, currentSearchTerm]);

  const currentItems = medicines;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4 ">
      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Loading/Error Messages */}
      {loading && <div className="text-center mt-4">Loading medicines...</div>}
      {error && <div className="text-center mt-4 text-red-500">Error loading medicines: {error.message || 'Unknown error'}</div>}

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          // Render skeletons when loading
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <MedicineCardSkeleton key={index} />
          ))
        ) : !error && currentItems.length > 0 ? (
          // Render actual medicine cards when loaded and not error
          currentItems.map(medicine => (
            <Link to={`/medicine/${medicine._id}`} key={medicine._id} className="block">
              <div className="bg-blue-50 mt-10 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 overflow-hidden text-center">
                <img 
                  src={medicine.image}
                  alt={medicine.name}
                  className="w-full h-48 object-cover mb-4 rounded-t-xl"
                />
                <div className="p-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{medicine.name}</h2>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{medicine.description}</p>
                  <p className="text-blue-700 font-extrabold text-lg mb-1">Rs: {medicine.price}</p>
                  <p className="text-gray-500 text-sm flex items-center justify-center">
                    Quantity: {medicine.quantity}
                    {medicine.quantity > 0 ? (
                      <span className="ml-2 text-green-600">✔️ In Stock</span>
                    ) : (
                      <span className="ml-2 text-red-600">❌ Out of Stock</span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : !loading && !error && currentItems.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 mt-8">No medicines found.</div>
        ) : null} {/* Render nothing if loading is false, error is true, and there are no items to show, or other unhandled states */}
      </div>

      {/* Pagination Controls */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-4 py-2 rounded-lg font-semibold ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home
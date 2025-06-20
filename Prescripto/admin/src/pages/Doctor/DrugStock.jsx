import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import DrugDetail from '../../components/DrugDetail';
import { assets } from '../../assets/assets';
import AddDrug from './AddDrug';
import { Plus } from 'lucide-react';

const DrugStock = () => {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [showAddDrug, setShowAddDrug] = useState(false);

  // Định nghĩa fetchDrugs ở đây để có thể truyền xuống AddDrug
  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:9000/api/doctor/get-drug-stock');
      setDrugs(res.data.data || []);
    } catch (err) {
      setError('Error loading drug list');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  useEffect(() => {
    setFilteredDrugs(drugs);
  }, [drugs]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredDrugs(drugs);
    } else {
      setFilteredDrugs(
        drugs.filter(drug =>
          (drug.drugName || "").toLowerCase().includes(search.toLowerCase()) ||
          (drug.drugCode || "").toLowerCase().includes(search.toLowerCase()) ||
          (drug.drugType || "").toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, drugs]);

  const handleDelete = async (drugId) => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      try {
        const res = await axios.delete(`http://localhost:9000/api/doctor/delete-drug/${drugId}`);
        if (res.data.success) {
          setDrugs(drugs.filter(drug => drug._id !== drugId));
        }
      } catch (err) {
        console.error('Error deleting drug:', err);
      }
    }
  };

  const handleViewDetail = (drug) => {
    setSelectedDrug(drug);
    setShowDetail(true);
  };

  // Function to check if drug is near expiry (within 30 days)
  const isNearExpiry = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  // Function to check if drug is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  // Function to check low stock (less than 10)
  const isLowStock = (quantity) => {
    return quantity < 10;
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    💊 Drug Inventory Management
                  </h1>
                  <p className="text-gray-600">
                    Manage and monitor your pharmaceutical inventory
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Add Drug Button */}
                  <button
                    onClick={() => setShowAddDrug(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    Add Drug
                  </button>

                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name, code, or type..."
                      className="pl-10 pr-4 py-3 w-full sm:w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Drugs</p>
                      <p className="text-2xl font-bold">{filteredDrugs.length}</p>
                    </div>
                    <div className="text-blue-200 text-2xl">📋</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">In Stock</p>
                      <p className="text-2xl font-bold">
                        {filteredDrugs.filter(drug => drug.inventoryQuantity > 10).length}
                      </p>
                    </div>
                    <div className="text-green-200 text-2xl">✅</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Low Stock</p>
                      <p className="text-2xl font-bold">
                        {filteredDrugs.filter(drug => isLowStock(drug.inventoryQuantity)).length}
                      </p>
                    </div>
                    <div className="text-orange-200 text-2xl">⚠️</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Expiring Soon</p>
                      <p className="text-2xl font-bold">
                        {filteredDrugs.filter(drug => isNearExpiry(drug.expiryDate) || isExpired(drug.expiryDate)).length}
                      </p>
                    </div>
                    <div className="text-red-200 text-2xl">⏰</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 font-medium">Loading drugs...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-red-600 text-4xl mb-2">❌</div>
              <div className="text-red-700 font-medium">{error}</div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Drug Inventory ({filteredDrugs.length} items)
                </h3>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Drug Info</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code & Type</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredDrugs.map((drug, idx) => (
                      <tr key={drug._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-600">
                            {idx + 1}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                {drug.drugName?.charAt(0) || 'D'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {drug.drugName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Unit: {drug.drugUnit}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                            {drug.drugCode}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {drug.drugType}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isLowStock(drug.inventoryQuantity)
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {drug.inventoryQuantity}
                              {isLowStock(drug.inventoryQuantity) && (
                                <span className="ml-1">⚠️</span>
                              )}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {drug.expiryDate ? new Date(drug.expiryDate).toLocaleDateString() : 'N/A'}
                          </div>
                          {drug.expiryDate && (
                            <div className="text-xs">
                              {isExpired(drug.expiryDate) ? (
                                <span className="text-red-600 font-medium">Expired ❌</span>
                              ) : isNearExpiry(drug.expiryDate) ? (
                                <span className="text-orange-600 font-medium">Expiring Soon ⚠️</span>
                              ) : (
                                <span className="text-green-600">Valid ✅</span>
                              )}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {drug.supplierName || 'N/A'}
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewDetail(drug)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition-colors duration-200 group"
                              title="View Details"
                            >
                              <img 
                                src={assets.view_detail_icon} 
                                alt="View" 
                                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
                              />
                            </button>
                            <button
                              onClick={() => handleDelete(drug._id)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors duration-200 group"
                              title="Delete Drug"
                            >
                              <img 
                                src={assets.delete_icon} 
                                alt="Delete" 
                                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" 
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredDrugs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">💊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No drugs found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Drug Detail Modal */}
          {showDetail && selectedDrug && (
            <DrugDetail
              drug={selectedDrug}
              onClose={() => {
                setShowDetail(false);
                setSelectedDrug(null);
              }}
              onUpdate={(updatedDrug) => {
                setDrugs(drugs.map(d => d._id === updatedDrug._id ? updatedDrug : d));
                setShowDetail(false);
                setSelectedDrug(null);
              }}
            />
          )}

          {/* Add Drug Modal */}
          {showAddDrug && (
           <div className="fixed inset-0 z-50 overflow-y-auto">
  <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                  <div className="absolute top-0 right-0 pt-4 pr-4">
                    <button
                      onClick={() => setShowAddDrug(false)}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <AddDrug onClose={() => setShowAddDrug(false)} onSuccess={() => {
                    setShowAddDrug(false);
                    fetchDrugs();
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrugStock;

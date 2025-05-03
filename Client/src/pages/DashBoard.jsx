// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

const API_URL =  'http://localhost:5000/api';

function Dashboard() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dnsStats } = useSocket();
  
  useEffect(() => {
    fetchDomains();
  }, []);
  
  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/domains`);
      setDomains(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching domains:', err);
      setError('Error fetching domains. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteDomain = async (id) => {
    if (!window.confirm('Are you sure you want to delete this domain?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/domains/${id}`);
      setDomains(domains.filter(domain => domain._id !== id));
    } catch (err) {
      console.error('Error deleting domain:', err);
      setError('Error deleting domain. Please try again.');
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">DNS Domains Dashboard</h1>
        <Link
          to="/add"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add Domain
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Requests</h2>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{dnsStats.totalRequests}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">From Database</h2>
          <p className="mt-1 text-3xl font-semibold text-green-600">{dnsStats.resolvedFromDb}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">From Cache</h2>
          <p className="mt-1 text-3xl font-semibold text-blue-600">{dnsStats.resolvedFromCache}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide">Fallback DNS</h2>
          <p className="mt-1 text-3xl font-semibold text-yellow-600">{dnsStats.forwardedToFallback}</p>
        </div>
      </div>
      
      {/* Domains Table */}
      <div className="bg-white shadow rounded">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">DNS Records</h3>
          <p className="mt-1 text-sm text-gray-500">
            All registered domains that will be resolved by your DNS server.
          </p>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading domains...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchDomains}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No domains found. Add your first domain to get started.</p>
            <Link
              to="/add"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Domain
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TTL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domains.map((domain) => (
                  <tr key={domain._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{domain.domain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        domain.type === 'A' ? 'bg-green-100 text-green-800' :
                        domain.type === 'CNAME' ? 'bg-blue-100 text-blue-800' :
                        domain.type === 'MX' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {domain.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{domain.data}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{domain.ttl}s</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(domain.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/add?edit=${domain._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteDomain(domain._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <Link
          to="/logs"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          View Live DNS Logs
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
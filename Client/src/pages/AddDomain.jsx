// client/src/pages/AddDomain.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL =  'http://localhost:5000/api';

function AddDomain() {
  const [formData, setFormData] = useState({
    domain: '',
    type: 'A',
    data: '',
    ttl: 3600,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [domainId, setDomainId] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in edit mode
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const editId = query.get('edit');
    
    if (editId) {
      setEditMode(true);
      setDomainId(editId);
      fetchDomain(editId);
    }
  }, [location.search]);
  
  const fetchDomain = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/domains/${id}`);
      const domain = response.data;
      
      setFormData({
        domain: domain.domain,
        type: domain.type,
        data: domain.data,
        ttl: domain.ttl,
      });
      
    } catch (err) {
      console.error('Error fetching domain:', err);
      setError('Failed to load domain information.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const validateForm = () => {
    // Check for empty fields
    if (!formData.domain || !formData.data) {
      setError('All fields are required');
      return false;
    }
    
    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(formData.domain)) {
      setError('Please enter a valid domain (e.g., example.com)');
      return false;
    }
    
    // Validate IP address for A records
    if (formData.type === 'A') {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.data)) {
        setError('Please enter a valid IPv4 address (e.g., 192.168.1.1)');
        return false;
      }
    }
    
    // Validate CNAME records
    if (formData.type === 'CNAME' && !domainRegex.test(formData.data)) {
      setError('Please enter a valid target domain for CNAME record');
      return false;
    }
    
    // Validate TTL
    if (formData.ttl < 60 || formData.ttl > 86400) {
      setError('TTL must be between 60 and 86400 seconds');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (editMode) {
        await axios.put(`${API_URL}/domains/${domainId}`, formData);
      } else {
        await axios.post(`${API_URL}/domains`, formData);
      }
      
      navigate('/');
    } catch (err) {
      console.error('Error saving domain:', err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred while saving the domain.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && editMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h1 className="text-lg font-medium text-gray-900">
          {editMode ? 'Edit DNS Record' : 'Add New DNS Record'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {editMode
            ? 'Update your existing DNS record details'
            : 'Add a new domain to be resolved by your DNS server'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
            Domain Name
          </label>
          <input
            type="text"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            placeholder="example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            The domain name for which you want to create a DNS record
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Record Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="A">A (Address Record)</option>
            <option value="CNAME">CNAME (Canonical Name)</option>
            <option value="MX">MX (Mail Exchange)</option>
            <option value="TXT">TXT (Text Record)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            The type of DNS record you want to create
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
            {formData.type === 'A' ? 'IP Address' : 
             formData.type === 'CNAME' ? 'Target Domain' :
             formData.type === 'MX' ? 'Mail Server (priority exchange)' : 'Text Value'}
          </label>
          <input
            type="text"
            id="data"
            name="data"
            value={formData.data}
            onChange={handleChange}
            placeholder={
              formData.type === 'A' ? '192.168.1.1' : 
              formData.type === 'CNAME' ? 'target.example.com' :
              formData.type === 'MX' ? '10 mail.example.com' : 'v=spf1 include:example.com ~all'
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.type === 'A' ? 'The IPv4 address this domain should resolve to' :
             formData.type === 'CNAME' ? 'The target domain this alias should point to' :
             formData.type === 'MX' ? 'Format: priority target (e.g., 10 mail.example.com)' :
             'Text value for this record'}
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="ttl" className="block text-sm font-medium text-gray-700 mb-1">
            TTL (Time To Live)
          </label>
          <input
            type="number"
            id="ttl"
            name="ttl"
            value={formData.ttl}
            onChange={handleChange}
            min="60"
            max="86400"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Time (in seconds) that DNS resolvers should cache this record (60s - 86400s)
          </p>
        </div>
        
        <div className="flex justify-between">
          <Link
            to="/"
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : editMode ? 'Update Record' : 'Add Record'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDomain;
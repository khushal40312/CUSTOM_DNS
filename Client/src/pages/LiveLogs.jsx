// client/src/pages/LiveLogs.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

function LiveLogs() {
  const { dnsLogs, isConnected } = useSocket();
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('all');
  const logsEndRef = useRef(null);
  
  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dnsLogs, autoScroll]);
  
  // Filter logs based on selection
  const filteredLogs = dnsLogs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'requests') return log.type === 'request';
    if (filter === 'responses') return log.type === 'response';
    if (filter === 'database') return log.type === 'response' && log.source === 'database';
    if (filter === 'fallback') return log.type === 'response' && log.source === 'fallback';
    return true;
  });
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Live DNS Logs</h1>
        <Link
          to="/"
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <div className="flex items-center justify-between flex-wrap">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                DNS Server Log Stream
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Real-time logs from your DNS server
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="filter" className="mr-2 text-sm font-medium text-gray-700">
                  Filter:
                </label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Logs</option>
                  <option value="requests">Requests Only</option>
                  <option value="responses">Responses Only</option>
                  <option value="database">Database Responses</option>
                  <option value="fallback">Fallback Responses</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  id="autoscroll"
                  type="checkbox"
                  checked={autoScroll}
                  onChange={() => setAutoScroll(!autoScroll)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoscroll" className="ml-2 text-sm text-gray-700">
                  Auto-scroll
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Time</div>
              <div className="col-span-1">Type</div>
              <div className="col-span-5">Domain</div>
              <div className="col-span-2">Record Type</div>
              <div className="col-span-2">Source</div>
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No DNS logs available. Waiting for requests...</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div 
                  key={index}
                  className={`px-4 py-2 border-b border-gray-100 ${
                    log.type === 'request' ? 'bg-blue-50' : 
                    log.source === 'database' ? 'bg-green-50' : 
                    log.source === 'fallback' ? 'bg-yellow-50' : 'bg-white'
                  }`}
                >
                  <div className="grid grid-cols-12 text-sm">
                    <div className="col-span-2 text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="col-span-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.type === 'request' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {log.type === 'request' ? 'REQ' : 'RES'}
                      </span>
                    </div>
                    <div className="col-span-5 font-medium text-gray-900">{log.domain}</div>
                    <div className="col-span-2">{log.type}</div>
                    <div className="col-span-2">
                      {log.type === 'request' ? 
                        <span className="text-gray-500">{log.client}</span> : 
                        <span className={`${
                          log.source === 'database' ? 'text-green-600' : 
                          log.source === 'fallback' ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {log.source || 'unknown'}
                        </span>
                      }
                    </div>
                  </div>
                  {log.type === 'response' && log.data && (
                    <div className="mt-1 ml-3 pl-3 border-l-2 border-gray-200 text-sm text-gray-600">
                      Response: {log.data}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right sm:px-6">
          <Link
            to="/"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LiveLogs;
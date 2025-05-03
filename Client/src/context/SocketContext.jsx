// client/src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [dnsLogs, setDnsLogs] = useState([]);
  const [dnsStats, setDnsStats] = useState({
    totalRequests: 0,
    resolvedFromDb: 0,
    resolvedFromCache: 0,
    forwardedToFallback: 0,
  });

  useEffect(() => {
    // Connect to WebSocket server
    const socketInstance = io( 'http://localhost:8001');
    
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });
    
    // Listen for DNS requests and responses
    socketInstance.on('dns:request', (data) => {
      setDnsLogs((prevLogs) => {
        const newLogs = [...prevLogs, { ...data, type: 'request' }];
        // Keep only the last 100 logs
        return newLogs.slice(-100);
      });
    });
    
    socketInstance.on('dns:response', (data) => {
      setDnsLogs((prevLogs) => {
        const newLogs = [...prevLogs, { ...data, type: 'response' }];
        // Keep only the last 100 logs
        return newLogs.slice(-100);
      });
    });
    
    // Listen for DNS stats updates
    socketInstance.on('dns:stats', (data) => {
      setDnsStats(data);
    });
    
    setSocket(socketInstance);
    
    // Clean up
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
  return (
    <SocketContext.Provider value={{ socket, isConnected, dnsLogs, dnsStats }}>
      {children}
    </SocketContext.Provider>
  );
};
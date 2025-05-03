import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/DashBoard.jsx';
import AddDomain from './pages/AddDomain.jsx';
import LiveLogs from './pages/LiveLogs.jsx';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="container mx-auto px-4 py-6 flex-grow">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddDomain />} />
              <Route path="/logs" element={<LiveLogs />} />
            </Routes>
          </div>
          <footer className="bg-gray-800 text-white py-4 text-center">
            <p className="text-sm">Mini DNS-as-a-Service &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
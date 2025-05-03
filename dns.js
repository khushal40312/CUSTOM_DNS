// dns-server/dns.js
const dgram = require('node:dgram');
const dnsPacket = require('dns-packet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);

// Load environment variables
dotenv.config();


const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  }
});

// WebSocket port
const WS_PORT =  8001;

// Start WebSocket server
httpServer.listen(WS_PORT, () => {
  console.log(`WebSocket server listening on port ${WS_PORT}`);
});

// Import Domain model
// We need to set this up after moving to dns-server directory
const Domain = require('./models/Domain');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mini-dns', {

}).then(() => console.log('DNS Server: MongoDB connected'))
  .catch(err => console.error('DNS Server: MongoDB connection error:', err));

// Create UDP server for DNS
const server = dgram.createSocket('udp4');

// Set up DNS server
const DNS_PORT = process.env.DNS_PORT || 53530;
 // Use 5353 in dev

const DNS_HOST = process.env.DNS_HOST || '0.0.0.0';

// Fallback DNS server
const FALLBACK_DNS = process.env.FALLBACK_DNS || '8.8.8.8';
const FALLBACK_DNS_PORT = process.env.FALLBACK_DNS_PORT || 53;

// Cache for DNS records
const dnsCache = new Map();

// Track DNS request statistics
const stats = {
  totalRequests: 0,
  resolvedFromDb: 0,
  resolvedFromCache: 0,
  forwardedToFallback: 0,
};

server.on('error', (err) => {
  console.error(`DNS server error:\n${err.stack}`);
  server.close();
});

server.on('listening', () => {
  const address = server.address();
  console.log(`DNS server listening on ${address.address}:${address.port}`);
});

server.on('message', async (msg, rinfo) => {
  try {
    stats.totalRequests++;
    
    // Decode the DNS request
    const request = dnsPacket.decode(msg);
    const domain = request.questions[0].name;
    const type = request.questions[0].type;
    
    console.log(`DNS request: ${domain} (${type})`);
    
    // Log DNS request via WebSocket
    io.emit('dns:request', {
      domain,
      type,
      client: rinfo.address,
      timestamp: new Date().toISOString(),
    });

    // Check if we have this domain in our database
    let response;
    
    // Check cache first
    const cacheKey = `${domain}:${type}`;
    if (dnsCache.has(cacheKey)) {
      stats.resolvedFromCache++;
      response = dnsCache.get(cacheKey);
      console.log(`Resolved ${domain} from cache`);
    } else {
      // Query database
      const domainRecord = await Domain.findOne({ 
        domain: domain.toLowerCase(),
        type: type
      });
      
      if (domainRecord) {
        stats.resolvedFromDb++;
        console.log(`Resolved ${domain} from database: ${domainRecord.data}`);
        
        // Create DNS response
        response = {
          id: request.id,
          type: 'response',
          flags: dnsPacket.RECURSION_DESIRED | dnsPacket.RECURSION_AVAILABLE,
          questions: request.questions,
          answers: [{
            name: domain,
            type: domainRecord.type,
            ttl: domainRecord.ttl,
            class: 'IN',
            data: domainRecord.data
          }]
        };
        
        // Cache the response for TTL duration
        dnsCache.set(cacheKey, response);
        setTimeout(() => {
          dnsCache.delete(cacheKey);
        }, domainRecord.ttl * 1000);
        
        // Log DNS response via WebSocket
        io.emit('dns:response', {
          domain,
          type: domainRecord.type,
          data: domainRecord.data,
          source: 'database',
          timestamp: new Date().toISOString(),
        });
      } else {
        // Forward to fallback DNS if not in our database
        stats.forwardedToFallback++;
        console.log(`Forwarding ${domain} to fallback DNS`);
        
        // Forward to fallback DNS
        response = await forwardToFallbackDns(request);
        
        // Log DNS response via WebSocket
        io.emit('dns:response', {
          domain,
          type,
          source: 'fallback',
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // Send response
    const responseBuffer = dnsPacket.encode(response);
    server.send(responseBuffer, 0, responseBuffer.length, rinfo.port, rinfo.address);
    
  } catch (error) {
    console.error('Error processing DNS request:', error);
  }
});

// Function to forward request to fallback DNS
function forwardToFallbackDns(request) {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    const requestBuffer = dnsPacket.encode(request);
    
    client.on('message', (msg) => {
      const response = dnsPacket.decode(msg);
      client.close();
      resolve(response);
    });
    
    client.on('error', (err) => {
      client.close();
      reject(err);
    });
    
    client.send(requestBuffer, 0, requestBuffer.length, FALLBACK_DNS_PORT, FALLBACK_DNS);
  });
}

// Log statistics periodically
setInterval(() => {
  console.log('DNS Server Statistics:');
  console.log(stats);
  io.emit('dns:stats', stats);
}, 60000); // Every minute

// Start DNS server
server.bind(DNS_PORT, DNS_HOST);

// API to get DNS server status
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    stats,
    cache: {
      size: dnsCache.size,
      keys: Array.from(dnsCache.keys()),
    }
  });
});

// Log WebSocket connections
io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected:', socket.id);
  });
});
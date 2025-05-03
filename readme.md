# Mini-DNS Server

A full-featured DNS server implementation with MongoDB storage, WebSocket monitoring, and a REST API for DNS record management. This project provides a customizable DNS infrastructure with real-time updates and monitoring capabilities.

![DNS Server](https://raw.githubusercontent.com/khushal40312/CUSTOM_DNS/main/banner.png)

## ✨ Features

- **Custom DNS Resolution**: Serve your own DNS records from MongoDB
- **Fallback Resolution**: Forward unknown domains to upstream DNS (e.g., Google DNS)
- **Real-time Monitoring**: WebSocket integration for live DNS traffic monitoring
- **DNS Caching**: Improve performance with configurable TTL-based caching
- **REST API**: Fully-featured API for DNS record management
- **Statistics**: Track request origins, resolution types, and performance
- **WebSocket Events**: Real-time notifications for DNS operations
- **Environment Configuration**: Easily configurable via environment variables

## 🚀 System Architecture

The Mini-DNS Server consists of three main components:

1. **DNS Server**: Handles DNS protocol communications
2. **API Server**: Provides REST endpoints for DNS record management
3. **WebSocket Server**: Enables real-time monitoring and notifications



## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/khushal40312/CUSTOM_DNS.git

# Navigate to the project directory
cd mini-dns

# Install dependencies
npm install
```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# DNS Server configuration
DNS_PORT=53530        # Port for DNS server to listen on
DNS_HOST=0.0.0.0      # Host address for DNS server
FALLBACK_DNS=8.8.8.8  # Fallback DNS server
FALLBACK_DNS_PORT=53  # Fallback DNS port

# API Server configuration
PORT=5000             # Port for API server
CLIENT_URL=http://localhost:5173  # Frontend client URL for CORS

# Database configuration
MONGODB_URI=mongodb://localhost:27017/mini-dns
```

## 🚀 Running the Servers

### Start DNS Server

```bash
node dns-server/dns.js
```

### Start API Server

```bash
node server/server.js
```

You should see:
```
DNS server listening on 0.0.0.0:53530
WebSocket server listening on port 8001
DNS Server: MongoDB connected
Server running on port 5000
```

## 🌐 API Endpoints

### Domains

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/domains` | Get all domains |
| GET    | `/api/domains/:domain` | Get a specific domain |
| POST   | `/api/domains` | Create a new domain |
| PUT    | `/api/domains/:id` | Update a domain |
| DELETE | `/api/domains/:id` | Delete a domain |

### Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/status` | Get DNS server status and statistics |

## 📝 API Usage Examples

### Create a new domain record

```bash
curl -X POST http://localhost:5000/api/domains \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "type": "A",
    "data": "192.168.1.10",
    "ttl": 3600
  }'
```

### Query DNS server

```bash
dig @localhost -p 53530 example.com
```

## 📊 WebSocket Events

The Mini-DNS Server emits the following WebSocket events:

| Event | Description | Data |
|-------|-------------|------|
| `dns:request` | A DNS request was received | `{ domain, type, client, timestamp }` |
| `dns:response` | A DNS response was sent | `{ domain, type, data, source, timestamp }` |
| `dns:stats` | DNS statistics (emitted every minute) | `{ totalRequests, resolvedFromDb, resolvedFromCache, forwardedToFallback }` |
| `domain:created` | A domain record was created | `{ domain, type, data, ttl }` |
| `domain:updated` | A domain record was updated | `{ domain, type, data, ttl }` |
| `domain:deleted` | A domain record was deleted | `{ domain }` |

## 📚 Data Models

### Domain

```javascript
{
  domain: String,    // The domain name (e.g., "example.com")
  type: String,      // Record type (e.g., "A", "CNAME", "MX")
  data: String,      // Record data (e.g., "192.168.1.1" for A records)
  ttl: Number,       // Time-to-live in seconds
  createdAt: Date,   // Record creation timestamp
  updatedAt: Date    // Record update timestamp
}
```

## 🔍 Architecture Details

### DNS Resolution Process

1. Client sends a DNS query to the server
2. Server checks internal cache for a matching record
3. If not found in cache, server queries MongoDB for the record
4. If found in MongoDB, responds with the record and caches it
5. If not found, forwards the request to the fallback DNS server
6. Response is sent back to the client

### Real-time Monitoring

All DNS operations are broadcast in real-time via WebSocket:
- DNS queries and responses
- Domain record operations (create, update, delete)
- Server statistics and performance metrics

## 🛡️ Security Considerations

- The DNS server operates on port 53530 by default, which does not require root privileges
- Configure firewalls to restrict access to the API and WebSocket servers
- Use environment variables for sensitive configuration
- Consider adding authentication for the API endpoints

## 🚧 Development Roadmap

- [ ] DNSSEC support
- [ ] Zone file import/export
- [ ] User authentication for API
- [ ] Admin dashboard
- [ ] Wildcard domain support
- [ ] Performance optimizations
- [ ] Containerization with Docker
- [ ] Automated testing



## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📬 Contact



Project Link: [https://github.com/khushal40312/CUSTOM_DNS](https://github.com/khushal40312/CUSTOM_DNS)

---

Made with ❤️ by [Khushal Sharma]
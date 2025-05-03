# Simple Node.js DNS Server

A lightweight DNS server implementation in Node.js that responds to DNS queries based on a configurable in-memory database. This project demonstrates how to build a basic authoritative DNS server using UDP sockets and DNS packet encoding/decoding.

## Features

- 🚀 Lightweight DNS server implementation in pure Node.js
- 🔍 Handles DNS A and CNAME record queries
- ⚡ Fast in-memory record storage
- 🛠️ Easily extendable for additional record types
- 📦 Minimal dependencies (only requires `dns-packet`)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/CUSTOM_DNS.git

# Navigate to the project directory
cd node-dns-server

# Install dependencies
npm install dns-packet
```

## Usage

### Starting the Server

```bash
node server.js
```

The DNS server will start and listen on UDP port 8053. You should see:

```
DNS IS RUNNING ON 8053
```

### Making DNS Queries

You can test the DNS server using tools like `dig`:

```bash
# Query for an A record
dig @localhost -p 8053 google.com

# Query for a CNAME record
dig @localhost -p 8053 yahoo.com CNAME
```

### Configure DNS Records

The DNS records are stored in an in-memory database defined in the code. Currently, it includes:

```javascript
const db = {
  "google.com": {
    data: "1.2.3.4",
    type: "A",
  },
  "yahoo.com": {
    data: "hidenode.network",
    type: "CNAME",
  },
};
```

To add or modify records, simply update the `db` object in the code.

## How It Works

1. Creates a UDP server that listens for DNS requests
2. When a request is received, it decodes the DNS packet using the `dns-packet` library
3. Looks up the requested domain name in the in-memory database
4. If found, constructs a response with the appropriate DNS record
5. Encodes the response as a DNS packet and sends it back to the client

## Supported Record Types

Currently, the server handles:

- **A records** - Maps a domain name to an IPv4 address
- **CNAME records** - Maps a domain name to another domain name

## Code Structure

```javascript
const dgram = require("node:dgram");
const dnspacket = require("dns-packet");
const server = dgram.createSocket("udp4");

// In-memory database of DNS records
const db = {
  "google.com": {
    data: "1.2.3.4",
    type: "A",
  },
  "yahoo.com": {
    data: "hidenode.network",
    type: "CNAME",
  },
};

// Handle incoming DNS requests
server.on("message", (msg, rinfo) => {
  // DNS packet processing logic here
});

// Start the server
server.bind(8053, () => console.log("DNS IS RUNNING ON 8053"));
```

## Extending the Server

### Adding New Record Types

To support additional DNS record types (like MX, TXT, etc.):

1. Update the record type check in the message handler
2. Add the new records to the `db` object with appropriate type indicators
3. Handle the specific encoding requirements for that record type

### Persistent Storage

To make DNS records persistent across server restarts:

1. Replace the in-memory `db` object with a file-based or database solution
2. Implement functions to read/write records to the persistent storage

## Limitations

- This is a basic implementation intended for educational purposes
- Limited record type support (primarily A and CNAME records)
- No caching or recursive resolution
- No zone file support
- No authentication or security features

## Future Improvements

- Add support for more record types (MX, TXT, SRV, etc.)
- Implement DNS caching
- Add zone file parsing
- Support for recursive DNS resolution
- Add DNSSEC support
- Implement rate limiting and other security features

## Acknowledgments

- [dns-packet](https://github.com/mafintosh/dns-packet) for DNS packet encoding/decoding

---

Made with ❤️ by [Khushal Sharma]

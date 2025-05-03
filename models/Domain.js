// server/models/Domain.js
const mongoose = require('mongoose');

const DomainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['A', 'CNAME', 'MX', 'TXT'],
    default: 'A',
  },
  data: {
    type: String,
    required: true,
    trim: true,
  },
  ttl: {
    type: Number,
    default: 3600, // Default TTL of 1 hour (in seconds)
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

;

// Created a method to convert to DNS record format
DomainSchema.methods.toDnsRecord = function() {
  const record = {
    name: this.domain,
    ttl: this.ttl,
    class: 'IN',
    type: this.type,
  };

  // Add data based on record type
  if (this.type === 'A') {
    record.data = this.data; // IP address
  } else if (this.type === 'CNAME') {
    record.data = this.data; // Target domain
  } else if (this.type === 'MX') {
    const [priority, exchange] = this.data.split(' ');
    record.data = {
      preference: parseInt(priority, 10),
      exchange: exchange
    };
  } else if (this.type === 'TXT') {
    record.data = this.data;
  }

  return record;
};

module.exports = mongoose.model('Domain', DomainSchema);
// server/routes/domains.js
const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');

// Get all domains
router.get('/', async (req, res) => {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.json(domains);
  } catch (err) {
    console.error('Error fetching domains:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific domain
router.get('/:domain', async (req, res) => {
  try {
    const domain = await Domain.findOne({ domain: req.params.domain.toLowerCase() });
    
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    res.json(domain);
  } catch (err) {
    console.error('Error fetching domain:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new domain
router.post('/', async (req, res) => {
  try {
    const { domain, type, data, ttl } = req.body;
    
    // Check if domain already exists
    const existingDomain = await Domain.findOne({ domain: domain.toLowerCase() });
    if (existingDomain) {
      return res.status(400).json({ message: 'Domain already exists' });
    }
    
    // Create new domain
    const newDomain = new Domain({
      domain: domain.toLowerCase(),
      type,
      data,
      ttl: ttl || 3600,
    });
    
    await newDomain.save();
    
    // Emit domain created event to all clients
    const io = req.app.get('io');
    io.emit('domain:created', newDomain);
    
    res.status(201).json(newDomain);
  } catch (err) {
    console.error('Error creating domain:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a domain
router.put('/:id', async (req, res) => {
  try {
    const { domain, type, data, ttl } = req.body;
    
    // Find and update domain
    const updatedDomain = await Domain.findByIdAndUpdate(
      req.params.id,
      {
        domain: domain.toLowerCase(),
        type,
        data,
        ttl: ttl || 3600,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    
    if (!updatedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    // Emit domain updated event to all clients
    const io = req.app.get('io');
    io.emit('domain:updated', updatedDomain);
    
    res.json(updatedDomain);
  } catch (err) {
    console.error('Error updating domain:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a domain
router.delete('/:id', async (req, res) => {
  try {
    const deletedDomain = await Domain.findByIdAndDelete(req.params.id);
    
    if (!deletedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    // Emit domain deleted event to all clients
    const io = req.app.get('io');
    io.emit('domain:deleted', deletedDomain);
    
    res.json({ message: 'Domain deleted successfully' });
  } catch (err) {
    console.error('Error deleting domain:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
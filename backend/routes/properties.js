const express = require('express');
const {
  createProperty,
  getOwnerProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getPublicProperties
} = require('../controllers/propertyController');
const { ownerAuth, auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

// Public routes
router.get('/public', getPublicProperties);
router.get('/:id', getProperty);

// Protected routes (owner only)
router.post('/', ownerAuth, upload.array('images', 10), createProperty);
router.get('/', ownerAuth, getOwnerProperties);
router.put('/:id', ownerAuth, upload.array('images', 10), updateProperty);
router.delete('/:id', ownerAuth, deleteProperty);

module.exports = router;
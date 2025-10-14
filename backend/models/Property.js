const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  rent: {
    type: Number,
    required: [true, 'Rent amount is required'],
    min: 0
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: 0
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: 0
  },
  images: [{
    filename: String,
    originalName: String,
    path: String
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  amenities: [String]
}, {
  timestamps: true
});

// Index for searching and filtering
propertySchema.index({ state: 1, city: 1, status: 1 });
propertySchema.index({ owner: 1 });

module.exports = mongoose.model('Property', propertySchema);
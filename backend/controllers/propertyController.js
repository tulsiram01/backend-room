const Property = require('../models/Property');
const ActivityLog = require('../models/ActivityLog');

// Create new property - Auto active
exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      state,
      city,
      address,
      rent,
      bedrooms,
      bathrooms,
      amenities
    } = req.body;

    const images = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path
    })) : [];

    const property = new Property({
      owner: req.user.id,
      title,
      description,
      state,
      city,
      address,
      rent: parseFloat(rent),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      images,
      amenities: amenities ? amenities.split(',') : [],
      status: 'active' // Auto active
    });

    await property.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'PROPERTY_CREATE',
      details: `Created property: ${title}`
    });

    res.status(201).json({
      success: true,
      message: 'Property listed successfully!',
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: error.message
    });
  }
};

// Get public properties - Only active properties
exports.getPublicProperties = async (req, res) => {
  try {
    const { state, city, minRent, maxRent, bedrooms } = req.query;
    
    let filter = { 
      status: 'active' // Only show active properties
    };

    if (state) filter.state = new RegExp(state, 'i');
    if (city) filter.city = new RegExp(city, 'i');
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = parseInt(minRent);
      if (maxRent) filter.rent.$lte = parseInt(maxRent);
    }
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);

    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(` Found ${properties.length} active properties`);

    res.json({
      success: true,
      data: properties,
      count: properties.length
    });
  } catch (error) {
    console.error('Error fetching public properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

// Get owner properties
exports.getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

// Get single property
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message
    });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own properties.'
      });
    }

    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path
      }));
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'PROPERTY_UPDATE',
      details: `Updated property: ${updatedProperty.title}`
    });

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message
    });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own properties.'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'PROPERTY_DELETE',
      details: `Deleted property: ${property.title}`
    });

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message
    });
  }
};
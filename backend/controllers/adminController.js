const User = require('../models/User');
const Property = require('../models/Property');
const ActivityLog = require('../models/ActivityLog');

// Get dashboard stats - Remove pending count
exports.getDashboardStats = async (req, res) => {
  try {
    console.log(' Fetching dashboard stats...');
    
    const totalUsers = await User.countDocuments({ role: 'owner' });
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ 
      status: 'active'
    });

    console.log(' Stats:', { totalUsers, totalProperties, activeProperties });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        activeProperties
      }
    });
  } catch (error) {
    console.error(' Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    console.log(' Fetching all users...');
    
    const users = await User.find({ role: 'owner' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Add properties count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const propertiesCount = await Property.countDocuments({ owner: user._id });
        return {
          ...user.toObject(),
          propertiesCount
        };
      })
    );

    console.log(` Found ${usersWithCounts.length} users`);

    res.json({
      success: true,
      data: usersWithCounts
    });
  } catch (error) {
    console.error(' Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    console.log(' Fetching all properties...');
    
    const properties = await Property.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    console.log(` Found ${properties.length} properties`);

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error(' Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message
    });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    console.log(' Fetching activity logs...');
    
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    console.log(` Found ${logs.length} activity logs`);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error(' Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs',
      error: error.message
    });
  }
};

// Toggle user status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(` Toggling user status for: ${id}`);
    
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'USER_STATUS_TOGGLE',
      details: `${user.isActive ? 'Activated' : 'Deactivated'} user: ${user.name}`
    });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error(' Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};
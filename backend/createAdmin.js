const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

const createAdminUser = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }
    
    console.log('📁 Using MongoDB Atlas...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // User schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      phone: String,
      isActive: Boolean
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@roomrental.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:');
      console.log('   📧 Email:', existingAdmin.email);
      console.log('   👤 Name:', existingAdmin.name);
      console.log('   🎯 Role:', existingAdmin.role);
      return;
    }

    // Create admin user with strong password
    const adminPassword = 'Tulsiram@07'; // Strong password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'tulsiramchandravanshi966@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+916268757307',
      isActive: true
    });

    await adminUser.save();
    console.log(' Admin user created successfully!');
    console.log('========================================');
    console.log(' Email: admin@roomrental.com');
    console.log(' Password: Admin@123');
    console.log(' Name: System Administrator');
    console.log(' Role: admin');
    console.log('========================================');
    console.log(' Password meets security requirements:');
    console.log('   - 8+ characters: ✓');
    console.log('   - Uppercase letter: ✓');
    console.log('   - Lowercase letter: ✓');
    console.log('   - Number: ✓');
    console.log('   - Special character: ✓');

  } catch (error) {
    console.error(' Error creating admin user:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
};

createAdminUser();
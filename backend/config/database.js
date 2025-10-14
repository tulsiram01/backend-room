const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGO_URI instead of MONGODB_URI
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/room_rental';
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string is not defined. Please check your .env file');
    }

    console.log(' Attempting to connect to MongoDB Atlas...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(` MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    console.log('\n MongoDB Atlas Troubleshooting:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify your MongoDB Atlas credentials');
    console.log('   3. Make sure your IP is whitelisted in MongoDB Atlas');
    console.log('   4. Check if the database name is correct');
    process.exit(1);
  }
};

module.exports = connectDB;
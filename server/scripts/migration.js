// migration.js
const mongoose = require('mongoose');
const User = require('../src/models/user');
require('dotenv').config({ path: '../.env' });

// Enhanced connection with timeout and debugging
async function connectDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('Connection URI:', process.env.DB_LINK ? 'Found' : 'Not found');
    
    // Set connection options - REMOVED unsupported options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000
      // REMOVED: bufferCommands: false,
      // REMOVED: bufferMaxEntries: 0
    };
    
    await mongoose.connect(process.env.DB_LINK, options);
    console.log('✅ Connected to MongoDB successfully');
    
    // Test the connection
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    console.log('📡 MongoDB ping successful:', result);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

async function migrateUsers() {
  try {
    await connectDB();
    
    // Add timeout to the find operation
    console.log('🔍 Searching for users...');
    const users = await User.find({}).maxTimeMS(30000); // 30 second timeout
    console.log(`Found ${users.length} users to migrate`);
    
    if (users.length === 0) {
      console.log('No users found in database');
      process.exit(0);
    }
    
    let migratedCount = 0;
    
    for (let user of users) {
      let updated = false;
      
      // Add isPhoneVerified field if missing
      if (user.isPhoneVerified === undefined) {
        user.isPhoneVerified = user.phoneNo ? true : false;
        updated = true;
        console.log(`📱 Adding isPhoneVerified to user: ${user.email}`);
      }
      
      // Initialize address object if missing
      if (!user.address) {
        user.address = {
          street: null,
          city: null,
          state: null,
          pinCode: null,
          country: 'India'
        };
        updated = true;
        console.log(`📍 Adding address object to user: ${user.email}`);
      }
      
      if (updated) {
        await user.save();
        migratedCount++;
        console.log(`✅ Updated user: ${user.email}`);
      } else {
        console.log(`⏭️  Skipped user: ${user.email} (already up to date)`);
      }
    }
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Users migrated: ${migratedCount}/${users.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    // Always close the connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
}

// Run migration
migrateUsers();

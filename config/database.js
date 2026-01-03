const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

let db;
let client;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri || uri === 'My MONGODB_URI') {
      throw new Error('MONGODB_URI not configured! Check your .env file');
    }

    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    
    db = client.db();
    console.log('✓ MongoDB connected successfully');
    
    return db;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Did you forget to call connectDB()?');
  }
  return db;
};

process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  }
});

module.exports = { connectDB, getDB, client };

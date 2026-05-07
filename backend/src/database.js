import mongoose from 'mongoose';

let memoryFallback = false;

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/EPMS';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    memoryFallback = false;
    console.log('Connected to MongoDB database EPMS.');
  } catch (error) {
    memoryFallback = true;
    console.warn('MongoDB connection failed. Using in-memory EPMS store for this session.');
    console.warn(error.message);
  }
};

export const isMongoConnected = () => !memoryFallback && mongoose.connection.readyState === 1;

export const databaseMode = () => (isMongoConnected() ? 'mongodb' : 'memory');

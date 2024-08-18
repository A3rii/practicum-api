import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGODB_ATLAS);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;

  dbConnection.once('open', () => {
    console.log(`Database connected` + process.env.MONGODB_ATLAS);
  });

  dbConnection.on('error', (err) => {
    console.error(`Connection error: ${err}`);
  });
};
export default connectDB;

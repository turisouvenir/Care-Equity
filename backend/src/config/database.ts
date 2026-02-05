import mongoose from 'mongoose';

// curl -s http://localhost:5001/db-status | cat  ( Try command to check database status)

export const connectDB = async (): Promise<void> => {
  const MONGODB_URI = process.env.MONGODB_URI || '';

  if (!MONGODB_URI) {
    console.warn(' MONGODB_URI is not defined in environment variables');
    console.warn('  Server will continue running, but database features will not work');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(' Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn(' Server will continue running, but database features will not work');
    // Don't exit - allow server to run without DB for testing
  }
};

export const getDBStatus = () => {
  // https://mongoosejs.com/docs/api/connection.html#Connection.prototype.readyState
  const readyState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const stateLabel =
    readyState === 0 ? 'disconnected' :
    readyState === 1 ? 'connected' :
    readyState === 2 ? 'connecting' :
    readyState === 3 ? 'disconnecting' :
    'unknown';

  return {
    readyState,
    state: stateLabel,
    name: mongoose.connection.name || null,
    host: (mongoose.connection as any).host || null,
  };
};

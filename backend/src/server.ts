import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, getDBStatus } from './config/database';
import { Hospital } from './models/Hospital';
import { CalculatedRating } from './models/CalculatedRating';

// Load environment variables from .env file
// This reads MONGODB_URI and PORT from backend/.env
dotenv.config();

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 5001; // Default to 5001 if PORT not set

// ==================== MIDDLEWARE ====================
// Middleware runs on every request before it reaches route handlers

// CORS (Cross-Origin Resource Sharing) middleware
// Allows frontend (running on different port) to make API requests
app.use(cors({
  origin: '*', // Allow all origins for development (use specific domain in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON body parser - parses JSON request bodies
app.use(express.json());

// URL-encoded body parser - parses form data
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
// Logs every incoming request with timestamp, method, and path
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next(); // Pass control to next middleware/route
});

// ==================== DATABASE CONNECTION ====================
// Connect to MongoDB Atlas (non-blocking - doesn't stop server if connection fails)
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
});

// Routes
import hospitalOutcomesRouter from './routes/hospitalOutcomes';
app.use('/api/hospital-outcomes', hospitalOutcomesRouter);

import scoresRouter from './routes/scores';
app.use('/api/scores', scoresRouter);

import adminRouter from './routes/admin';
app.use('/admin', adminRouter);

// Basic route
// ==================== ROUTES ====================

/**
 * GET /
 * Basic API root endpoint - confirms server is running
 */
app.get('/', (req, res) => {
  res.json({ message: 'Care Equity API is running' });
});

/**
 * GET /health
 * Health check endpoint - used to verify server is responding
 * Returns current timestamp
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * GET /db-status
 * Database status endpoint - used for debugging MongoDB connection
 * Returns MongoDB connection state and database info
 * 
 * Try: curl http://localhost:5001/db-status
 */
app.get('/db-status', (req, res) => {
  res.json({
    status: 'OK',
    db: getDBStatus(), // Returns connection state from database.ts
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /test-collections
 * 
 * Debug endpoint to check what collections exist and how many documents are in each
 */
app.get('/test-collections', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.json({ error: 'Database not connected' });
    }
    
    const collections = await db.listCollections().toArray();
    const collectionInfo = await Promise.all(
      collections.map(async (col) => {
        const count = await db.collection(col.name).countDocuments();
        return { name: col.name, count };
      })
    );
    
    res.json({
      database: mongoose.connection.name,
      collections: collectionInfo,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list collections',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /ratings
 * 
 * Returns all hospitals with their calculated ratings joined together.
 * This endpoint:
 * 1. Fetches all hospitals from the 'hospitals' collection
 * 2. Fetches all ratings from the 'calculatedRatings' collection
 * 3. Joins them by matching hospitalId in ratings to _id in hospitals
 * 4. Returns a combined array with hospital info + rating data
 * 
 * Used by the frontend Quality Ratings page to display the hospital table.
 */
app.get('/ratings', async (req, res) => {
  try {
    // Step 1: Fetch all hospitals from MongoDB
    // .lean() returns plain JavaScript objects (faster, no Mongoose overhead)
    const hospitals = await Hospital.find({}).lean();
    console.log(`[DEBUG] Found ${hospitals.length} hospitals in 'hospitals' collection`);
    
    // Step 2: Fetch all calculated ratings from MongoDB
    const ratings = await CalculatedRating.find({}).lean();
    console.log(`[DEBUG] Found ${ratings.length} ratings in 'CalculatedRatings' collection`);
    
    // Debug: Log first rating to see structure
    if (ratings.length > 0) {
      console.log(`[DEBUG] Sample rating structure:`, JSON.stringify(ratings[0], null, 2));
    }
    
    // Step 3: Create a Map for O(1) lookup performance
    // Maps hospitalId (e.g., "HOSP_001") to its rating object
    // This is faster than nested loops when joining data
    const ratingMap = new Map(ratings.map(r => [r.hospitalId, r]));
    
    // Step 4: Join hospitals with their ratings
    // For each hospital, find its matching rating and combine the data
    const hospitalsWithRatings = hospitals.map(hospital => {
      // Look up the rating for this hospital (returns undefined if not found)
      const rating = ratingMap.get(hospital._id);
      
      // Return combined object with hospital info + rating data
      // Use optional chaining (?.) and nullish coalescing (||) for safe defaults
      return {
        hospitalId: hospital._id,           // Hospital ID (e.g., "HOSP_001")
        name: hospital.name,                // Hospital name
        city: hospital.city,                // City location
        state: hospital.state,              // State location
        location: `${hospital.city}, ${hospital.state}`, // Combined location string
        overallGrade: rating?.overallGrade || 'N/A',     // Overall grade (A-D) or 'N/A' if no rating
        overallScore: rating?.overallScore || null,       // Overall score (0-100) or null
        equityGapScore: rating?.equityGapScore || null,   // Equity gap score or null
        // Extract byGroup data - handle both object and nested structure
        byGroup: rating?.byGroup && typeof rating.byGroup === 'object' && Object.keys(rating.byGroup).length > 0
          ? rating.byGroup
          : {},                   // Ratings by demographic group or empty object
      };
    });
    
    // Step 5: Return success response with joined data
    res.json({
      success: true,
      data: hospitalsWithRatings,          // Array of hospitals with ratings
      count: hospitalsWithRatings.length,  // Total count for frontend display
    });
  } catch (error) {
    // Handle any errors (database connection, query failures, etc.)
    console.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ratings',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

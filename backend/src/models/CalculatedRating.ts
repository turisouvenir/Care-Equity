import mongoose, { Schema, Document } from 'mongoose';

/**
 * ByGroup Interface
 * 
 * Represents ratings broken down by demographic groups.
 * Each group has a score (0-100) and a letter grade (A-D).
 * All fields are optional because not all hospitals may have data for all groups.
 */
export interface IByGroup {
  Black?: { score: number; grade: string };     // Rating for Black patients
  White?: { score: number; grade: string };     // Rating for White patients
  Hispanic?: { score: number; grade: string }; // Rating for Hispanic patients
}

/**
 * CalculatedRating Model
 * 
 * Represents a computed rating for a hospital.
 * These ratings are calculated from patientReports + hospitalOutcomes data.
 * This model maps to the 'calculatedRatings' collection in MongoDB.
 * 
 * The frontend reads from this collection to display ratings on the Quality Ratings page.
 */
export interface ICalculatedRating extends Document {
  hospitalId: string;        // Foreign key: links to Hospital._id (e.g., "HOSP_001")
  updatedAt: Date;           // When this rating was last calculated/updated
  overallScore: number;      // Overall score (0-100)
  overallGrade: string;      // Overall letter grade (A, B, C, or D)
  equityGapScore: number;    // Measure of disparity across groups (higher = more disparity)
  byGroup?: IByGroup;        // Optional breakdown by demographic group
}

// Define the MongoDB schema for CalculatedRating documents
const CalculatedRatingSchema = new Schema<ICalculatedRating>({
  hospitalId: { type: String, required: true },   // Must match a Hospital._id
  updatedAt: { type: Date, required: true },     // Timestamp of last calculation
  overallScore: { type: Number, required: true }, // 0-100 score
  overallGrade: { type: String, required: true }, // A, B, C, or D
  equityGapScore: { type: Number, required: true }, // Disparity measure
  byGroup: {
    type: Schema.Types.Mixed,  // Mixed type allows flexible nested structure
    required: false,            // Optional: some hospitals may not have group breakdowns
  },
});

// Create and export the Mongoose model
// Parameters: model name, schema, collection name (must match MongoDB collection)
// Note: Collection name is 'CalculatedRatings' (capital C) to match MongoDB
export const CalculatedRating = mongoose.model<ICalculatedRating>(
  'CalculatedRating',
  CalculatedRatingSchema,
  'CalculatedRatings'
);

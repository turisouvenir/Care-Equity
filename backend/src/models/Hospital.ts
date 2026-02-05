import mongoose, { Schema } from 'mongoose';

/**
 * Hospital Model
 * 
 * Represents a hospital in the database.
 * This model maps to the 'hospitals' collection in MongoDB.
 * 
 * Note: We use custom string IDs (like "HOSP_001") instead of MongoDB's auto-generated ObjectIds
 * for easier readability and joining with other collections.
 */
export interface IHospital {
  _id: string;      // Custom ID (e.g., "HOSP_001", "HOSP_002")
  name: string;     // Hospital name (e.g., "City General Hospital")
  city: string;    // City where hospital is located (e.g., "New York")
  state: string;   // State abbreviation (e.g., "NY", "CA")
}

// Define the MongoDB schema (structure) for Hospital documents
const HospitalSchema = new Schema<IHospital>({
  _id: { type: String, required: true },   // Custom string ID (required)
  name: { type: String, required: true },  // Hospital name (required)
  city: { type: String, required: true },  // City (required)
  state: { type: String, required: true }, // State (required)
}, { _id: false }); // Disable auto _id generation since we use custom IDs

// Create and export the Mongoose model
// Parameters: model name, schema, collection name (must match MongoDB collection)
// Note: Collection name is 'Hospitals' (capital H) to match MongoDB
export const Hospital = mongoose.model<IHospital>('Hospital', HospitalSchema, 'Hospitals');

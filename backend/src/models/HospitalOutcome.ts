import mongoose, { Schema, Document } from 'mongoose';

type OutcomeRates = {
  Black?: number;
  White?: number;
  Hispanic?: number;
  [key: string]: number | undefined;
};

export interface IHospitalOutcome extends Document {
  hospitalId: string;
  year: number;
  maternalMortalityPer100k: OutcomeRates;
  infantMortalityPer1000: OutcomeRates;
  severeComplicationsRate: OutcomeRates;
  cSectionRate: OutcomeRates;
  createdAt?: Date;
  updatedAt?: Date;
}

const OutcomeRatesSchema = new Schema<OutcomeRates>(
  {
    Black: { type: Number },
    White: { type: Number },
    Hispanic: { type: Number },
  },
  { _id: false }
);

const HospitalOutcomeSchema = new Schema<IHospitalOutcome>(
  {
    hospitalId: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    maternalMortalityPer100k: { type: OutcomeRatesSchema, required: true },
    infantMortalityPer1000: { type: OutcomeRatesSchema, required: true },
    severeComplicationsRate: { type: OutcomeRatesSchema, required: true },
    cSectionRate: { type: OutcomeRatesSchema, required: true },
  },
  { timestamps: true }
);

// Create and export the Mongoose model
// Explicitly specify collection name to avoid duplicates
const HospitalOutcome = mongoose.model<IHospitalOutcome>(
  'HospitalOutcome', 
  HospitalOutcomeSchema,
  'HospitalOutcomes'  // Explicit collection name (capital H and S)
);
export default HospitalOutcome;

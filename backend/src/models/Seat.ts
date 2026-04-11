import mongoose, { Document, Schema } from 'mongoose';

export interface ISeat extends Document {
    division: string;
    seatName: string;
    mpName: string;
    party: string;
    partyLogo?: string;
    candidateImage?: string;
    lastRecordedAsset: string;
    fiveYearBackAsset?: string;
    fiveYearGrowthPercentage: number;
    order: number;
}

const seatSchema = new Schema<ISeat>({
    division: { type: String, required: true },
    seatName: { type: String, required: true, unique: true },
    mpName: { type: String, required: true },
    party: { type: String, required: true },
    partyLogo: { type: String },
    candidateImage: { type: String },
    lastRecordedAsset: { type: String, default: "N/A" },
    fiveYearBackAsset: { type: String },
    fiveYearGrowthPercentage: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
}, { timestamps: true });

export const Seat = mongoose.model<ISeat>('Seat', seatSchema);

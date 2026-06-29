import { Schema, model, Document, Types } from "mongoose";

export interface IReading extends Document {
  userId: Types.ObjectId;
  value: number;
  meal: string;
  timeOfDay: string;
  date: string;
  time: string;
  createdAt: Date;
}

const ReadingSchema = new Schema<IReading>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  value: { type: Number, required: true },
  meal: { type: String, required: true },
  timeOfDay: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Reading = model<IReading>("Reading", ReadingSchema);

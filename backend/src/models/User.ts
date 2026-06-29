import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
  name?: string;
  phone?: string;
  age?: number;
  weight?: number;
  diabetesType?: string;
  emergencyContact?: string;
  healthScore?: number;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpires: { type: Date },
  name: { type: String, default: "John Doe" },
  phone: { type: String, default: "+1 234 567 8900" },
  age: { type: Number, default: 45 },
  weight: { type: Number, default: 75 },
  diabetesType: { type: String, default: "type2" },
  emergencyContact: { type: String, default: "+1 234 567 8901" },
  healthScore: { type: Number, default: 85 },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const User = model<IUser>("User", UserSchema);

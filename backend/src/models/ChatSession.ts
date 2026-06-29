import { Schema, model, Document, Types } from "mongoose";

export interface IMessage {
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

export interface IChatSession extends Document {
  userId: Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  text: { type: String, required: true },
  sender: { type: String, enum: ["user", "ai"], required: true },
  timestamp: { type: String, required: true }
});

const ChatSessionSchema = new Schema<IChatSession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const ChatSession = model<IChatSession>("ChatSession", ChatSessionSchema);

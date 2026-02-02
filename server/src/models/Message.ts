import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  roomCode: string;
  name: string;
  message: string;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    roomCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for efficient querying of room messages
messageSchema.index({ roomCode: 1, timestamp: 1 });

// TTL index to automatically delete messages after 24 hours
messageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);

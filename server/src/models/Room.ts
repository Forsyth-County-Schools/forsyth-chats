import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  code: string;
  createdAt: Date;
  creatorName?: string;
}

const roomSchema = new Schema<IRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      length: 10,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    creatorName: {
      type: String,
      trim: true,
      maxlength: 30,
    },
  },
  {
    timestamps: true,
  }
);


export const Room = mongoose.model<IRoom>('Room', roomSchema);

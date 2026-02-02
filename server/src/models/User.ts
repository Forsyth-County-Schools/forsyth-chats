import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  displayName: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field before saving
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
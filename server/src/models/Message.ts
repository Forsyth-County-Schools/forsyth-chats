import mongoose, { Document, Schema } from 'mongoose';

// Reaction interface
interface IReaction {
  emoji: string;
  users: string[];
  count: number;
}

// Attachment interface
interface IAttachment {
  type: 'image' | 'file';
  filename: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
}

// Link metadata interface
interface ILinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain: string;
}

export interface IMessage extends Document {
  roomCode: string;
  name: string;
  message: string;
  timestamp: Date;
  replyTo?: string; // Message ID being replied to
  reactions: IReaction[];
  attachments: IAttachment[];
  linkPreviews: ILinkPreview[];
  edited?: boolean;
  editedAt?: Date;
}

const reactionSchema = new Schema<IReaction>(
  {
    emoji: { type: String, required: true },
    users: [{ type: String, required: true }],
    count: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const attachmentSchema = new Schema<IAttachment>(
  {
    type: { type: String, enum: ['image', 'file'], required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false }
);

const linkPreviewSchema = new Schema<ILinkPreview>(
  {
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    image: { type: String },
    domain: { type: String, required: true },
  },
  { _id: false }
);

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
    replyTo: {
      type: String, // ObjectId as string
      ref: 'Message',
      default: null,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    linkPreviews: {
      type: [linkPreviewSchema],
      default: [],
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
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

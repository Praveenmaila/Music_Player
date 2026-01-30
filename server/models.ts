import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  role: string;
  createdAt: Date;
}

export interface ISong extends Document {
  title: string;
  artist: string;
  filePath: string;
  coverPath?: string;
  duration: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ISongLike extends Document {
  userId: mongoose.Types.ObjectId;
  songId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});

const songSchema = new Schema<ISong>({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  filePath: { type: String, required: true },
  coverPath: { type: String },
  duration: { type: Number, default: 0 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const songLikeSchema = new Schema<ISongLike>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  songId: { type: Schema.Types.ObjectId, ref: "Song", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create compound index for likes
songLikeSchema.index({ userId: 1, songId: 1 }, { unique: true });

export const UserModel = mongoose.model<IUser>("User", userSchema);
export const SongModel = mongoose.model<ISong>("Song", songSchema);
export const SongLikeModel = mongoose.model<ISongLike>("SongLike", songLikeSchema);

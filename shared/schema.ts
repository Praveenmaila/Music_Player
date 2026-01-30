import { z } from "zod";

// Mongoose schemas will be defined in server
// These are just the TypeScript types and Zod schemas for validation

export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const insertSongSchema = z.object({
  title: z.string().min(1, "Song title is required"),
  artist: z.string().min(1, "Artist name is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type InsertSong = z.infer<typeof insertSongSchema>;

export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  createdAt: Date;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  filePath: string;
  coverPath?: string;
  duration: number;
  uploadedBy: string;
  createdAt: Date;
}

export interface SongLike {
  id: string;
  userId: string;
  songId: string;
  createdAt: Date;
}

export type SongWithLikes = Song & { 
  likeCount: number;
  isLiked: boolean;
  uploaderUsername?: string;
};

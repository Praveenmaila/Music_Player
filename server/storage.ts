import { 
  type User, 
  type InsertUser, 
  type Song,
  type SongWithLikes,
} from "@shared/schema";
import { UserModel, SongModel, SongLikeModel } from "./models";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Song operations
  createSong(song: { title: string; artist: string; filePath: string; duration?: number; uploadedBy: string }): Promise<Song>;
  getAllSongs(userId?: string): Promise<SongWithLikes[]>;
  getSongById(id: string): Promise<Song | undefined>;
  deleteSong(id: string): Promise<void>;
  
  // Like operations
  toggleLike(userId: string, songId: string): Promise<boolean>;
  getLikedSongs(userId: string): Promise<SongWithLikes[]>;
  isLiked(userId: string, songId: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    if (!user) return undefined;
    return {
      id: (user._id as any).toString(),
      username: user.username,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return undefined;
    return {
      id: (user._id as any).toString(),
      username: user.username,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return {
      id: (user._id as any).toString(),
      username: user.username,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async createSong(song: { title: string; artist: string; filePath: string; duration?: number; uploadedBy: string }): Promise<Song> {
    const newSong = await SongModel.create(song);
    return {
      id: (newSong._id as any).toString(),
      title: newSong.title,
      artist: newSong.artist,
      filePath: newSong.filePath,
      duration: newSong.duration,
      uploadedBy: newSong.uploadedBy.toString(),
      createdAt: newSong.createdAt,
    };
  }

  async getAllSongs(userId?: string): Promise<SongWithLikes[]> {
    const allSongs = await SongModel.find().lean();
    
    const songsWithLikes: SongWithLikes[] = await Promise.all(
      allSongs.map(async (song) => {
        const likeCount = await SongLikeModel.countDocuments({ songId: song._id });
        const isLiked = userId 
          ? await this.isLiked(userId, song._id.toString())
          : false;
        
        const uploader = await UserModel.findById(song.uploadedBy).lean();

        return {
          id: song._id.toString(),
          title: song.title,
          artist: song.artist,
          filePath: song.filePath,
          duration: song.duration,
          uploadedBy: song.uploadedBy.toString(),
          createdAt: song.createdAt,
          likeCount,
          isLiked,
          uploaderUsername: uploader?.username,
        };
      })
    );
    
    return songsWithLikes;
  }

  async getSongById(id: string): Promise<Song | undefined> {
    const song = await SongModel.findById(id).lean();
    if (!song) return undefined;
    return {
      id: song._id.toString(),
      title: song.title,
      artist: song.artist,
      filePath: song.filePath,
      duration: song.duration,
      uploadedBy: song.uploadedBy.toString(),
      createdAt: song.createdAt,
    };
  }

  async deleteSong(id: string): Promise<void> {
    await SongLikeModel.deleteMany({ songId: id });
    await SongModel.findByIdAndDelete(id);
  }

  async toggleLike(userId: string, songId: string): Promise<boolean> {
    const existingLike = await SongLikeModel.findOne({ userId, songId });

    if (existingLike) {
      await SongLikeModel.deleteOne({ userId, songId });
      return false;
    } else {
      await SongLikeModel.create({ userId, songId });
      return true;
    }
  }

  async getLikedSongs(userId: string): Promise<SongWithLikes[]> {
    const likes = await SongLikeModel.find({ userId }).lean();
    const songIds = likes.map(like => like.songId);

    const likedSongs = await SongModel.find({ _id: { $in: songIds } }).lean();

    const songsWithLikes: SongWithLikes[] = await Promise.all(
      likedSongs.map(async (song) => {
        const likeCount = await SongLikeModel.countDocuments({ songId: song._id });
        const uploader = await UserModel.findById(song.uploadedBy).lean();

        return {
          id: song._id.toString(),
          title: song.title,
          artist: song.artist,
          filePath: song.filePath,
          duration: song.duration,
          uploadedBy: song.uploadedBy.toString(),
          createdAt: song.createdAt,
          likeCount,
          isLiked: true,
          uploaderUsername: uploader?.username,
        };
      })
    );

    return songsWithLikes;
  }

  async isLiked(userId: string, songId: string): Promise<boolean> {
    const like = await SongLikeModel.findOne({ userId, songId });
    return !!like;
  }
}

export const storage = new MongoStorage();

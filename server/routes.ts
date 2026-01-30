import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, requireAdmin, generateToken, type AuthRequest } from "./middleware/auth";
import { insertUserSchema, loginSchema, insertSongSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { parseFile } from "music-metadata";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for both song and cover uploads
const songUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "song") {
      if (file.mimetype === "audio/mpeg" || file.mimetype === "audio/mp3") {
        cb(null, true);
      } else {
        cb(new Error("Only MP3 files are allowed"));
      }
    } else if (file.fieldname === "cover") {
      const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed."));
      }
    } else {
      cb(null, false);
      cb(new Error("Unexpected field"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Accept-Ranges", "bytes");
    next();
  });
  
  // Only require auth for audio files, allow public access to images
  app.use("/uploads", (req, res, next) => {
    const filePath = path.basename(req.path);
    const ext = path.extname(filePath).toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    // Skip auth for image files
    if (imageExtensions.includes(ext)) {
      return next();
    }
    
    // Require auth for other files (audio)
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  });
  
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  }, (req, res, next) => {
    const filePath = path.join(uploadsDir, path.basename(req.path));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    next();
  }, (req, res, next) => {
    res.sendFile(path.join(uploadsDir, path.basename(req.path)));
  });

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const token = generateToken(user.id, user.role);
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(data.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify role matches if provided
      if (data.role && user.role !== data.role) {
        return res.status(401).json({ message: "Invalid credentials or incorrect role selected" });
      }

      const token = generateToken(user.id, user.role);
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Song Routes
  app.get("/api/songs", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const songs = await storage.getAllSongs(req.userId);
      res.json(songs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/liked", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const songs = await storage.getLikedSongs(req.userId!);
      res.json(songs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch liked songs" });
    }
  });

  app.get("/api/songs/:id/stream", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const song = await storage.getSongById(req.params.id);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }

      const filePath = path.join(uploadsDir, path.basename(song.filePath));
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Audio file not found" });
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "audio/mpeg",
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          "Content-Length": fileSize,
          "Content-Type": "audio/mpeg",
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to stream audio" });
    }
  });

  app.post("/api/songs/upload", authenticateToken, requireAdmin, songUpload.fields([
    { name: "song", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]), async (req: AuthRequest, res) => {
    try {
      // Validate that we got the files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (!files.song || !files.song[0]) {
        return res.status(400).json({ message: "No song file uploaded" });
      }

      const { title, artist } = req.body;
      
      if (!title || !artist) {
        // Clean up files if validation fails
        fs.unlinkSync(files.song[0].path);
        if (files.cover?.[0]) fs.unlinkSync(files.cover[0].path);
        return res.status(400).json({ message: "Title and artist are required" });
      }

      // Get audio duration from MP3 metadata
      let duration = 0;
      try {
        const metadata = await parseFile(files.song[0].path);
        duration = Math.round(metadata.format.duration || 0);
      } catch (error) {
        console.error('Error reading audio metadata:', error);
      }

      // Create song with all fields
      const songData = {
        title,
        artist,
        filePath: files.song[0].filename,
        coverPath: files.cover?.[0]?.filename,
        duration,
        uploadedBy: req.userId!,
      };

      console.log('Creating song with data:', songData);
      const song = await storage.createSong(songData);

      res.json(song);
    } catch (error: any) {
      // Clean up both song and cover files on error
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files?.song?.[0]) {
          fs.unlinkSync(files.song[0].path);
        }
        if (files?.cover?.[0]) {
          fs.unlinkSync(files.cover[0].path);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up files:', cleanupError);
      }
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  });

  app.delete("/api/songs/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const song = await storage.getSongById(req.params.id);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }

      // Delete the song file
      const filePath = path.join(uploadsDir, path.basename(song.filePath));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete the cover image if it exists
      if (song.coverPath) {
        const coverPath = path.join(uploadsDir, path.basename(song.coverPath));
        if (fs.existsSync(coverPath)) {
          fs.unlinkSync(coverPath);
        }
      }

      await storage.deleteSong(req.params.id);
      res.json({ message: "Song deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete song" });
    }
  });

  app.post("/api/songs/:id/like", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const isLiked = await storage.toggleLike(req.userId!, req.params.id);
      res.json({ isLiked });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to toggle like" });
    }
  });

  // Update song durations (admin only)
  app.post("/api/songs/update-durations", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const songs = await storage.getAllSongsBasic();
      let updated = 0;
      let errors = 0;

      for (const song of songs) {
        try {
          const filePath = path.join(uploadsDir, path.basename(song.filePath));
          if (fs.existsSync(filePath)) {
            const metadata = await parseFile(filePath);
            const duration = Math.round(metadata.format.duration || 0);
            
            if (duration > 0 && song.duration !== duration) {
              // Update duration in database
              await storage.updateSongDuration(song.id, duration);
              updated++;
            }
          }
        } catch (error) {
          console.error(`Error updating duration for song ${song.id}:`, error);
          errors++;
        }
      }

      res.json({ 
        message: `Updated ${updated} songs, ${errors} errors`,
        updated,
        errors
      });
    } catch (error: any) {
      console.error('Update durations error:', error);
      res.status(500).json({ message: error.message || "Failed to update durations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

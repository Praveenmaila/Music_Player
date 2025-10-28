# Music Player Clone

A beautiful music streaming application built with React, Express, and MongoDB. Features include user authentication, music playback controls, admin song uploads, and a like system.

## Features

### User Features
- 🎵 Browse and play songs from the library
- ⏯️ Full playback controls (play, pause, next, previous)
- ❤️ Like/unlike songs
- 📱 Responsive design for all devices
- 🎨 Beautiful, modern UI inspired by Spotify

### Admin Features
- 📤 Upload new songs (MP3 files)
- 🗑️ Delete songs from library
- 👥 User role management

## Tech Stack

### Frontend
- **React** - UI framework
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Lucide React** - Icons

### Backend
- **Express.js** - Web server
- **MongoDB with Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd music-player
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/music-player
   SESSION_SECRET=your-super-secret-jwt-key-change-this
   ```

4. **Start MongoDB**
   
   If running locally:
   ```bash
   mongod
   ```
   
   Or use MongoDB Atlas and update the `MONGODB_URI` in your `.env` file.

5. **Run the application**
   ```bash
   npm run dev
   ```

6. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Creating an Admin User

After registering a regular user, you can manually update the user's role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { username: "your-username" },
  { $set: { role: "admin" } }
)
```

Or use a MongoDB GUI like MongoDB Compass to update the user's role to "admin".

## Usage

### As a User
1. Register a new account or login
2. Browse the song library
3. Click on a song card to play it
4. Use the bottom player controls to manage playback
5. Click the heart icon to like songs
6. View your liked songs in the "Liked Songs" section

### As an Admin
1. Login with an admin account
2. Navigate to the "Upload" section
3. Fill in song details (title and artist)
4. Upload an MP3 file
5. Manage existing songs (delete unwanted tracks)

## Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities and contexts
│   │   └── App.tsx       # Main app component
│   └── index.html
├── server/               # Backend Express application
│   ├── db.ts            # MongoDB connection
│   ├── models.ts        # Mongoose models
│   ├── storage.ts       # Data access layer
│   ├── routes.ts        # API routes
│   ├── middleware/      # Auth middleware
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Zod validation schemas
└── uploads/             # Uploaded song files
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/liked` - Get user's liked songs
- `GET /api/songs/:id/stream` - Stream a song (with range support)
- `POST /api/songs/upload` - Upload a new song (admin only)
- `DELETE /api/songs/:id` - Delete a song (admin only)
- `POST /api/songs/:id/like` - Toggle like on a song

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (admin/user)
- Secure file upload validation
- Protected API endpoints

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

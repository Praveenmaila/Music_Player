# Music Player Clone

A beautiful music streaming application built with React, Express, and MongoDB. Features include user authentication, music playback controls, admin song uploads, and a like system.

## Features

### User Features
- 🎵 Browse and play songs from the library
- ⏯️ Full playback controls (play, pause, next, previous)
- ❤️ Like/unlike songs
- 📱 Responsive design for all devices
- 🎨 Beautiful, modern UI inspired by Spotify
- 👤 Role selection during registration (User/Admin)
- 🔐 Secure authentication with role-based access

### Admin Features
- 📤 Upload new songs (MP3 files)
- 🖼️ Add custom cover images for songs
- 🗑️ Delete songs from library
- 👥 User role management
- 🎭 Role selection at signup and signin

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

You can now select the "Admin" role directly during registration. Simply choose "Admin" from the role dropdown when creating your account.

**Important:** During login, make sure to select the same role you registered with. The role dropdown validates that you're logging in with the correct role.

Alternatively, you can manually update an existing user's role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { username: "your-username" },
  { $set: { role: "admin" } }
)
```

## Usage

### As a User
1. Register a new account by selecting "User" role or login with your credentials
2. Browse the song library on the home page
3. Click on a song card to play it
4. Use the bottom player controls to manage playback (play, pause, next, previous)
5. Click the heart icon to like/unlike songs
6. View your liked songs in the "Liked Songs" section
7. Enjoy seamless music streaming with beautiful UI

### As an Admin
1. Register or login with "Admin" role selected
2. Access all user features plus admin-specific capabilities
3. Navigate to the "Upload" section from the sidebar
4. Fill in song details (title and artist)
5. Upload MP3 files to expand the library
6. Optionally add custom cover images (JPEG, PNG, GIF, or WebP)
7. Manage existing songs (delete unwanted tracks)
8. Monitor and manage user interactions

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
- `POST /api/songs/upload` - Upload a new song with optional cover image (admin only)
- `DELETE /api/songs/:id` - Delete a song and its cover (admin only)
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

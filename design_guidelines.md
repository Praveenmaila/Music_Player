# Design Guidelines: Simple Music Player Clone

## Design Approach
**Reference-Based Approach** inspired by Spotify and Apple Music, focusing on an immersive music listening experience with clean, modern aesthetics and intuitive playback controls.

## Core Design Principles
- **Content-First**: Prioritize the music library and player controls
- **Minimalist Elegance**: Clean layouts with generous whitespace for focus
- **Spatial Hierarchy**: Clear visual separation between player, library, and navigation
- **Consistent Density**: Maintain uniform spacing across song lists and controls

## Typography System

**Font Families** (via Google Fonts CDN):
- Primary: 'Inter' - All UI elements, song titles, navigation
- Secondary: 'DM Sans' - Artist names, metadata, timestamps

**Type Scale**:
- Hero/Player Title: text-2xl font-semibold (currently playing song)
- Song Titles in List: text-base font-medium
- Artist Names: text-sm font-normal
- Metadata/Timestamps: text-xs font-normal
- Navigation/Buttons: text-sm font-medium
- Section Headers: text-lg font-semibold

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 or p-6
- Section gaps: gap-4 or gap-6
- Icon-text spacing: gap-2
- Large separations: mt-8, mb-8

**Grid Structure**:
- Main App Layout: Fixed bottom player (h-24) + scrollable content area (calc(100vh - 6rem))
- Sidebar Navigation: Fixed left sidebar (w-64) on desktop, collapsible hamburger on mobile
- Song List: Single column, full-width cards with hover states
- Admin Upload Form: Centered container (max-w-2xl)

## Component Library

### Navigation & Layout
**Sidebar Navigation** (Desktop):
- Fixed left sidebar with logo at top
- Vertical nav links (Home, Library, Liked Songs)
- User profile section at bottom
- Width: w-64, Height: full viewport

**Mobile Navigation**:
- Top bar with hamburger menu
- Logo centered
- User icon right-aligned
- Slide-out drawer for navigation

### Music Player (Fixed Bottom)
**Layout**: Full-width fixed bar at bottom (h-24) with three sections:
- Left: Album art thumbnail (h-16 w-16) + song info (title/artist)
- Center: Playback controls (previous, play/pause, next) + progress bar below
- Right: Volume control, like button

**Controls Arrangement**:
- Icon buttons in horizontal flex (gap-4)
- Play/pause button slightly larger (h-12 w-12) than others (h-10 w-10)
- Progress bar: full width below controls with time stamps (current/total)

**Progress Bar**:
- Thin slider with draggable thumb
- Time display: "2:34 / 4:12" format on sides
- Hover state shows enlarged thumb

### Song List/Library
**Song Card Design**:
- Horizontal layout: Album art thumbnail (h-14 w-14) + song info + duration + like button
- Hover state: Subtle elevation, play button overlay on thumbnail
- Padding: p-4, Rounded: rounded-lg
- Border between items: border-b with minimal opacity

**Song Info Layout**:
- Song title on first line
- Artist name below in smaller, subdued text
- Right-aligned: Duration (3:45) and like heart icon

### Authentication Pages
**Login/Register Forms**:
- Centered card (max-w-md) on solid background
- Logo at top-center
- Form fields with spacing (space-y-4)
- Primary CTA button (full width)
- Toggle link to switch between login/register
- Clean, minimal design with form focus

### Admin Upload Interface
**Upload Form**:
- Centered container (max-w-2xl)
- Large drag-and-drop zone for MP3 files
- Input fields for title and artist (space-y-4)
- File preview showing selected filename
- Submit button (full width or right-aligned)

**Admin Song Management**:
- Same song list as user view
- Added actions column: Edit and Delete icons
- Upload button floating or in header

### Buttons & Controls
**Primary Buttons**:
- Rounded: rounded-full for player controls, rounded-lg for form buttons
- Padding: px-6 py-3 for text buttons, p-3 for icon buttons
- Font weight: font-medium

**Icon Buttons**:
- Circular background for player controls
- Ghost/transparent for secondary actions
- Like button: outline heart (unliked), filled heart (liked)

**States**: Native button hover/active states, no custom implementations

## Icons
**Icon Library**: Heroicons (via CDN)
- Playback: play-circle, pause-circle, forward, backward
- Actions: heart, heart-solid, plus-circle, trash, pencil
- Navigation: home, musical-note, bars-3, x-mark
- Upload: cloud-arrow-up, document-arrow-up

## Images

**Album Art Placeholders**:
- Song thumbnails in list: 56x56px (h-14 w-14)
- Player thumbnail: 64x64px (h-16 w-16)
- Default placeholder: Gradient or music note icon when no art available
- Rounded corners: rounded-md for all album art

**Auth Page Background** (Optional):
- Abstract music-themed gradient or subtle pattern
- Low opacity to keep form readable

**No Hero Section**: This is a web application, not a marketing site

## Responsive Behavior

**Desktop (lg and up)**:
- Sidebar visible (w-64)
- Three-column player layout
- Song list with all metadata visible

**Tablet (md)**:
- Collapsible sidebar
- Two-column player (info + controls merged)
- Abbreviated song metadata

**Mobile (base)**:
- Hamburger navigation
- Single-column player (stacked vertically)
- Compact song cards with essential info only
- Bottom navigation bar (alternative to hamburger)

## Accessibility
- All controls keyboard navigable
- ARIA labels for icon buttons ("Play", "Pause", "Like song")
- Focus visible states on all interactive elements
- Time format readable by screen readers
- Form inputs with proper labels and error states

## Animation Guidelines
**Minimal, Purposeful Animations**:
- Play/pause icon transition: Smooth morph between states (0.2s)
- Like button: Gentle scale bounce on click (0.3s)
- Progress bar: Smooth update (linear)
- Page transitions: Subtle fade (0.15s)
- Avoid: Auto-playing visualizers, excessive scroll animations

## Special Considerations
- Progress bar updates smoothly during playback
- Player state persists across page navigation
- Like state immediately reflects in UI (optimistic update)
- Loading states for song fetching and authentication
- Empty states with helpful messages ("No songs yet", "Upload your first song")
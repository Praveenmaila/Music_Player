import { Play, Heart, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SongWithLikes } from "@shared/schema";
import placeholderImage from "@assets/generated_images/Album_art_placeholder_gradient_7073f39b.png";

interface SongCardProps {
  song: SongWithLikes;
  onPlay: () => void;
  onLike: () => void;
  onDelete?: () => void;
  isPlaying?: boolean;
  showAdminActions?: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SongCard({ song, onPlay, onLike, onDelete, isPlaying, showAdminActions }: SongCardProps) {
  return (
    <div 
      className="group flex items-center gap-4 p-4 rounded-lg border-b hover-elevate"
      data-testid={`card-song-${song.id}`}
    >
      {/* Album Art with Play Overlay */}
      <div className="relative flex-shrink-0">
        <img 
          src={song.coverPath ? `/uploads/${song.coverPath}` : placeholderImage}
          alt={song.title}
          className="h-14 w-14 rounded-md object-cover"
        />
        <div 
          className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={onPlay}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 bg-white/90 hover:bg-white rounded-full"
            data-testid={`button-play-${song.id}`}
            aria-label={`Play ${song.title}`}
          >
            <Play className="h-5 w-5 text-black ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-base truncate" data-testid={`text-song-title-${song.id}`}>
          {song.title}
        </p>
        <p className="text-sm text-muted-foreground truncate" data-testid={`text-song-artist-${song.id}`}>
          {song.artist}
        </p>
      </div>

      {/* Duration */}
      <span className="text-xs text-muted-foreground hidden sm:block" data-testid={`text-duration-${song.id}`}>
        {song.duration ? formatDuration(song.duration) : '--:--'}
      </span>

      {/* Like Count */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-likes-${song.id}`}>
        <Heart className="h-4 w-4" />
        <span>{song.likeCount}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onLike}
          data-testid={`button-like-${song.id}`}
          aria-label={song.isLiked ? "Unlike song" : "Like song"}
          className="h-9 w-9"
        >
          <Heart className={cn("h-4 w-4", song.isLiked && "fill-primary text-primary")} />
        </Button>

        {showAdminActions && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              data-testid={`button-delete-${song.id}`}
              aria-label="Delete song"
              className="h-9 w-9 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

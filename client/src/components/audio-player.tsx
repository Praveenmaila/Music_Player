import { Play, Pause, SkipForward, SkipBack, Heart } from "lucide-react";
import { useAudio } from "@/lib/audio-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import placeholderImage from "@assets/generated_images/Album_art_placeholder_gradient_7073f39b.png";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface AudioPlayerProps {
  onToggleLike?: () => void;
  isLiked?: boolean;
}

export function AudioPlayer({ onToggleLike, isLiked }: AudioPlayerProps) {
  const { currentSong, isPlaying, currentTime, duration, togglePlayPause, playNext, playPrevious, seek } = useAudio();

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-card border-t flex items-center justify-center z-50">
        <p className="text-sm text-muted-foreground">No song playing</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-card border-t z-50">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center gap-4">
        {/* Left: Song Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img 
            src={currentSong.coverPath ? `/uploads/${currentSong.coverPath}` : placeholderImage} 
            alt={currentSong.title}
            className="h-16 w-16 rounded-md object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-base truncate" data-testid="text-current-song-title">
              {currentSong.title}
            </p>
            <p className="text-sm text-muted-foreground truncate" data-testid="text-current-song-artist">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              data-testid="button-previous"
              aria-label="Previous song"
              className="h-10 w-10"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={togglePlayPause}
              data-testid="button-play-pause"
              aria-label={isPlaying ? "Pause" : "Play"}
              className="h-12 w-12 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              data-testid="button-next"
              aria-label="Next song"
              className="h-10 w-10"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(value) => seek(value[0])}
              className="flex-1"
              data-testid="slider-progress"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Like Button */}
        <div className="flex items-center justify-end flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleLike}
            data-testid="button-like-player"
            aria-label={isLiked ? "Unlike song" : "Like song"}
            className="h-10 w-10"
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-primary text-primary")} />
          </Button>
        </div>
      </div>
    </div>
  );
}

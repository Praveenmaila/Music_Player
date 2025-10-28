import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useAudio } from "@/lib/audio-context";
import type { SongWithLikes } from "@shared/schema";
import { SongCard } from "@/components/song-card";
import { AudioPlayer } from "@/components/audio-player";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { useEffect } from "react";

export default function Liked() {
  const { isAuthenticated } = useAuth();
  const { playSong, setPlaylist, currentSong } = useAudio();
  const { toast } = useToast();

  const { data: songs, isLoading } = useQuery<SongWithLikes[]>({
    queryKey: ["/api/songs/liked"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (songs) {
      setPlaylist(songs);
    }
  }, [songs, setPlaylist]);

  const likeMutation = useMutation({
    mutationFn: async (songId: string) => {
      return await apiRequest("POST", `/api/songs/${songId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs/liked"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleToggleLike = (songId: string) => {
    likeMutation.mutate(songId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading liked songs...</p>
        </div>
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-semibold">No Liked Songs</h2>
          <p className="text-muted-foreground">
            Songs you like will appear here. Start exploring and like your favorites!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto pb-24">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-semibold mb-6">Liked Songs</h1>
          <div className="space-y-1">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onPlay={() => playSong(song)}
                onLike={() => handleToggleLike(song.id)}
                isPlaying={currentSong?.id === song.id}
              />
            ))}
          </div>
        </div>
      </div>
      <AudioPlayer 
        onToggleLike={() => currentSong && handleToggleLike(currentSong.id)}
        isLiked={currentSong?.isLiked}
      />
    </div>
  );
}

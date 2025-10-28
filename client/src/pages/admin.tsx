import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useAudio } from "@/lib/audio-context";
import type { SongWithLikes } from "@shared/schema";
import { SongCard } from "@/components/song-card";
import { AudioPlayer } from "@/components/audio-player";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Music } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Admin() {
  const { isAdmin, isAuthenticated } = useAuth();
  const { playSong, currentSong } = useAudio();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);

  const { data: songs, isLoading } = useQuery<SongWithLikes[]>({
    queryKey: ["/api/songs"],
    enabled: isAuthenticated && isAdmin,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !title || !artist) {
        throw new Error("Please fill in all fields and select a file");
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("song", file);

      const response = await fetch("/api/songs/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "Success!",
        description: "Song uploaded successfully.",
      });
      setTitle("");
      setArtist("");
      setFile(null);
      const fileInput = document.getElementById("song-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (songId: string) => {
      return await apiRequest("DELETE", `/api/songs/${songId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "Song deleted",
        description: "The song has been removed from the library.",
      });
      setDeleteDialogOpen(false);
      setSongToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (songId: string) => {
      return await apiRequest("POST", `/api/songs/${songId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
    },
  });

  const handleDelete = (songId: string) => {
    setSongToDelete(songId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (songToDelete) {
      deleteMutation.mutate(songToDelete);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto pb-24">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload New Song
              </CardTitle>
              <CardDescription>
                Add a new song to the music library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); uploadMutation.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Song Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter song title"
                    data-testid="input-song-title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist">Artist Name</Label>
                  <Input
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Enter artist name"
                    data-testid="input-artist-name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="song-file">MP3 File</Label>
                  <Input
                    id="song-file"
                    type="file"
                    accept=".mp3,audio/mpeg"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    data-testid="input-song-file"
                    required
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={uploadMutation.isPending}
                  data-testid="button-upload"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload Song"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Song Management */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Manage Songs</h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
                  <p className="text-muted-foreground">Loading songs...</p>
                </div>
              </div>
            ) : !songs || songs.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Music className="h-16 w-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-medium">No Songs Yet</h3>
                <p className="text-muted-foreground">
                  Upload your first song using the form above!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {songs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onPlay={() => playSong(song)}
                    onLike={() => likeMutation.mutate(song.id)}
                    onDelete={() => handleDelete(song.id)}
                    isPlaying={currentSong?.id === song.id}
                    showAdminActions
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <AudioPlayer 
        onToggleLike={() => currentSong && likeMutation.mutate(currentSong.id)}
        isLiked={currentSong?.isLiked}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the song
              from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              data-testid="button-confirm-delete"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

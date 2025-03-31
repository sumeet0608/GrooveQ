"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Ban, Music2 } from "lucide-react";

type Song = {
  id: string;
  title: string;
  addedBy: {
    name: string | null;
    email: string;
  };
  upvotes: number;
  downvotes: number;
  isPlaying: boolean;
};

export default function AdminPanel() {
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/songs");
      const data = await res.json();
      setSongs(data.songs);
      setLoading(false);
    };

    fetchSongs();
  }, []);

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/admin/songs/${id}`, {
      method: "DELETE",
    });
  
    if (res.ok) {
      setSongs((prev) => prev?.filter((s) => s.id !== id) ?? []);
    }
  };
  

  const handleBlockUser = async (email: string) => {
    const res = await fetch("/api/admin/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  
    if (res.ok) {
      alert(`Blocked ${email} from this session.`);
    } else {
      alert("Failed to block user.");
    }
  };
  

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 text-foreground">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin w-4 h-4" />
          Loading songs...
        </div>
      ) : !songs || songs.length === 0 ? (
        <p className="text-muted-foreground">No songs in the queue.</p>
      ) : (
        <div className="space-y-4">
          {songs.map((song) => (
            <Card
              key={song.id}
              className={`border ${song.isPlaying ? "border-green-500" : "border-border"}`}
            >
              <CardContent className="p-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    {song.isPlaying && <Music2 className="text-green-500 w-4 h-4" />}
                    <h2 className="text-lg font-semibold">{song.title}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Added by {song.addedBy.name ?? "Unknown"} ({song.addedBy.email})
                  </p>
                  <p className="text-sm mt-1">
                    👍 {song.upvotes} | 👎 {song.downvotes}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="destructive" onClick={() => handleRemove(song.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                  <Button variant="outline" onClick={() => handleBlockUser(song.addedBy.email)}>
                    <Ban className="w-4 h-4 mr-2" />
                    Block User
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

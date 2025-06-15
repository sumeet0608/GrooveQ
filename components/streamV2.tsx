'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from './ui/button'
import { PiArrowFatUpLight, PiArrowFatDownThin } from "react-icons/pi";
import { Input } from './ui/input'
import { streamSchema } from '@/schema';
import { toast } from "sonner"
import { YT_REGEX } from '@/lib/utils';
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { SpaceHeader } from './space-header';
import YouTubePlayer from "youtube-player";
import Link from 'next/link';
import Chat from './chat';
import BidSolana from './BidSolana';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { BackgroundBeams } from './ui/background-beams';
import { BackgroundGradient } from './ui/background-gradient';
import { Spotlight } from './ui/spotlight-new';

interface SpaceData {
  activeStream: {
    song: {
      id: string
    }
  }
  spaceName?: string;
  spaceDesc?: string;
  isCreator?: boolean;
  spaceId: string
  spaceRunning: boolean
}

interface Video {
  id: string;
  type: string;
  url: string;
  extractedId: string;
  title: string;
  bigImg: string;
  smallImg: string;
  active: boolean;
  userId: string;
  upvotes: number;
  bidAmount: number;
  haveUpvoted: boolean;
  spaceId: string;
  artist: string;
}

const REFRESH_INTERVAL_MS = 5 * 1000;

export default function StreamV2({
  hostId,
  playVideo = false,
  spaceId
}: {
  hostId: string;
  playVideo: boolean;
  spaceId: string;
}) {
  const [url, setUrl] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [data, setData] = useState<SpaceData>()
  const [currentSong, setCurrentSong] = useState<Video | null>(null);
  const [nextSong, setNextSong] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoPlayer = useRef<HTMLDivElement>(null);

  const removeCurrentSongFromDB = async () => {

    if (!currentSong) {
      console.warn("removeCurrentSongFromDB: No current song to remove.");
      return; // Exit if no current song
    }
  
    try {
      await fetch(`/api/streams/remove`, {
        method: "DELETE",
        body: JSON.stringify({ spaceId: spaceId, songId: currentSong.id })
      });
      refresh(); // Refresh after removing song
    } catch (error) {
      console.error("Error removing current song:", error);
    }
  };

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/streams/?spaceId=${spaceId}`)
      const data = await res.json()
      setData(data)

      if (data.streams && Array.isArray(data.streams)) {
        const sortedStreams = data.streams.sort((a: any, b: any) => {
          if (a.bidAmount !== b.bidAmount) {
            return (b.bidAmount || 0) - (a.bidAmount || 0);
          }
          return b.upvotes - a.upvotes;
        });

        setQueue(sortedStreams);
      } else {
        setQueue([]);
      }

      setCurrentSong((prevSong) => {
        if (data?.activeStream?.song) {
          if (!prevSong || prevSong.id !== data.activeStream.song.id) {
            return data.activeStream.song;
          }
        }
        return prevSong;
      });
    } catch (error: any) {
      setQueue([]);
      setCurrentSong(null);
    } finally {
      setLoading(false)
    }
  }, [spaceId]);
  const highestBidInQueue = queue.reduce((max, song) => Math.max(max, song.bidAmount), 0);

  if (data?.spaceRunning === false) {
    return (
      <div className='flex flex-col min-h-screen items-center justify-center'>
        <h1 className='text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400  to-red-500'>
          Thanks for tuning in, The space has been ended
        </h1>
        <div className='flex justify-center items-center space-x-4 mt-4'>
          <Link href="/dashboard">
            <Button type="submit" className="bg-purple-600 text-white hover:bg-purple-700">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const playNext = async () => {
    console.log("playNext: Function called.");
    console.log("playNext: Current song before removal check:", currentSong);
    console.log("playNext: Queue length before removal check:", queue.length);
  
    if (currentSong) {
      console.log("playNext: Removing current song from DB:", currentSong.id);
      await removeCurrentSongFromDB();
      console.log("playNext: Current song removed from DB (or attempted).");
    }
  
    if (queue.length > 0) {
      console.log("playNext: Queue has songs. Attempting to fetch next.");
      try {
        setNextSong(true);
        console.log("playNext: setNextSong(true).");
  
        const data = await fetch(`/api/streams/next?spaceId=${spaceId}`, {
          method: "GET",
        });
        const json = await data.json();
  
        console.log("playNext: API response for next song:", json);
  
        if (json.stream) {
          console.log("playNext: New stream received from API:", json.stream.title);
          setCurrentSong(json.stream);
          // Log the queue state after filtering, but it's often more informative
          // to see the result of the `refresh` call that happens shortly after.
          // For immediate debugging, you could log it here too.
          setQueue((q) => {
            const newQueue = q.filter((x) => x.id !== json.stream.id);
            console.log("playNext: Queue after filtering:", newQueue.map(s => s.title));
            return newQueue;
          });
        } else {
          console.log("playNext: No new stream received from API. Clearing current song and queue.");
          setCurrentSong(null);
          setQueue([]);
        }
      } catch (e) {
        console.error("playNext: ERROR playing next song:", e);
        setCurrentSong(null);
        setQueue([]);
      } finally {
        setNextSong(false);
        console.log("playNext: setNextSong(false). Finally block executed.");
      }
    } else {
      console.log("playNext: Queue is empty. Clearing current song.");
      setCurrentSong(null);
    }
    console.log("playNext: Function finished.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast.error("Song url cannot cannot be empty")
      return;
    }
    if (!url.match(YT_REGEX)) {
      toast.error("Invalid YouTube URL format");
      return;
    }
    setLoading(true);
    try {
      const postData = streamSchema.parse({ url, hostId, spaceId });
      const response = await fetch(`/api/streams`, {
        method: 'POST',
        headers: { 'content-type': "application/json" },
        body: JSON.stringify(postData)
      })
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "An error occurred")

      setQueue([...queue, data])
      setUrl("")
      toast.success("song added to queue successfully")
      refresh(); // Refresh after adding song
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (songId: string, isUpvote: boolean) => {
    toast.success("Voted successfully")
    await fetch(`/api/streams/upvote`, {
      method: isUpvote ? "POST" : "DELETE",
      body: JSON.stringify({ songId })
    })
    refresh(); // Refresh after upvote
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome to show the confirmation dialog
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!currentSong && queue.length > 0 && !nextSong) {
      playNext();
    }
  }, [currentSong, queue, nextSong]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (!currentSong || !videoPlayer.current)
      return;

    const player = YouTubePlayer(videoPlayer.current,
      {
        videoId: currentSong.extractedId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          controls: 1,
          disablekb: 0,
          enablejsapi: 0,
          fs: 0,
          rel: 0,
          origin: window.location.origin,
          widget_referrer: window.location.origin,
        }
      }
    );
    player.playVideo();

    const eventHandler = (event: { data: number }) => {
      if (event.data === 0) {
        playNext();
      }
    };
    player.on("stateChange", eventHandler);

    return () => {
      player.destroy();
    };
  }, [currentSong, videoPlayer]);

  return (
    <div className="min-h-screen flex flex-col">
      <Spotlight/>
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8 rounded-lg p-4">
          <SpaceHeader
            data={{
              spaceName: data?.spaceName,
              spaceDesc: data?.spaceDesc,
              isCreator: data?.isCreator ?? false,
              spaceId: spaceId,
            }}
          />
        </div>

        {/* Main Content - Video Player and Chat Side by Side */}

       
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Music Player */}
          <BackgroundGradient className="rounded p-2">
          <Card className="bg-black shadow-lg h-[calc(100vh-20rem)]">
            <CardContent className="p-6 space-y-4 h-full flex flex-col">
              <h2 className="text-2xl font-bold text-white">Now Playing</h2>
              {currentSong ? (
                <div className="flex-1 flex flex-col">
                  {playVideo ? (
                    <div
                      ref={videoPlayer}
                      className="w-full flex-1"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <div className="flex-1 relative">
                        <Image
                          src={currentSong.bigImg}
                          className="w-full h-full object-cover rounded-md"
                          alt={currentSong.title}
                          fill
                        />
                      </div>
                      <p className="mt-2 text-center font-semibold text-white">
                        {currentSong.title}
                      </p>
                      <p className="mt-2 text-center font-semibold text-white">
                        {currentSong.artist}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-400">
                  No song playing, Add a song in the queue
                </p>
              )}
            </CardContent>
          </Card>
        </BackgroundGradient>

          {/* Right: Chat */}


          <div className="h-[calc(103vh-20rem)]">
              <Chat spaceId={spaceId} isCreator={data?.isCreator as boolean} />
          </div>

        </div>

        {/* Queue Section */}
        <div className="mt-8 w-full rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Queue</h2>
              {/* Add Song Form */}
              <form onSubmit={handleSubmit} className="flex gap-3 w-1/3">
                <Input
                  placeholder="Enter song URL"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                
                <Button 
                  disabled={loading} 
                  type="submit" 
                  className="bg-purple-600 text-white hover:bg-purple-700 whitespace-nowrap"
                >
                  {loading ? "adding..." : "Add to Queue"}
                </Button>
              </form>
            </div>

            {url && url.match(YT_REGEX) && !loading && (
              <div className="mt-2">
                <LiteYouTubeEmbed
                  title=""
                  id={url.split("?v=")[1]}
                />
                <p className="text-sm text-gray-400">YouTube Preview</p>
              </div>
            )}

            {queue.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700 shadow-lg">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-center py-8 text-gray-400">
                    No Songs in queue
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="w-full pb-4 whitespace-nowrap rounded-md no-scrollbar" type='always'>
                <div className="flex space-x-4 pb-2 pt-1">
                  {queue.map((song) => (
                    <div
                      key={song.id}
                      className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 hover:bg-gray-800 hover:scale-105 hover:shadow-xl transition-all duration-300 flex-shrink-0 w-64 group"
                    >
                      <div className="p-4 flex flex-col">
                        <div className="relative overflow-hidden rounded-md mb-3">
                          <Image
                            width={60}
                            height={60}
                            alt={`${song.title} thumbnail`}
                            src={song.smallImg}
                            className="w-full h-40 object-cover rounded-md group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="mb-3">
                          <p className="font-medium text-lg truncate group-hover:text-purple-400 transition-colors">{song.title}</p>
                          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`hover:bg-gray-700 ${song.haveUpvoted ? 'text-green-400' : 'text-gray-400'}`}
                              onClick={() => handleUpvote(song.id, !song.haveUpvoted)}
                            >
                              {song.haveUpvoted ? (
                                <PiArrowFatUpLight className="h-8 w-8" />
                              ) : (
                                <PiArrowFatDownThin className="h-8 w-8" />
                              )}
                            </Button>
                            <span className="text-sm font-medium">{song.upvotes}</span>
                          </div>

                          <div className="flex items-center">
                            <div className="relative group inline-block">
                              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                Current bid on this song
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent text-amber-400 border border-amber-500/50 hover:bg-transparent hover:text-white"
                              >
                                {song.bidAmount}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <BidSolana
                        songId={song.id}
                        spaceId={spaceId}
                        refresh={refresh}
                        currentHighestBidInSpace={highestBidInQueue} // NEW PROP
                      />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
      {/* <BackgroundBeams /> */}
    </div>
  )
} 
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
import { BackgroundGradient } from './ui/background-gradient';
import { Spotlight } from './ui/spotlight-new';
import { io, Socket } from 'socket.io-client';
import { HashLoader } from "react-spinners";

// --- Interfaces (Updated SpaceData.activeStream.song to be a full Video) ---
interface SpaceData {
  activeStream: {
    song: Video; // Changed this to be a full Video object
  } | null; // activeStream can be null if no song is playing
  spaceName?: string;
  spaceDesc?: string;
  isCreator?: boolean; // This will determine if the current user is the host (passed from page.tsx)
  spaceId: string;
  spaceRunning: boolean;
  hostId: string;
  streams?: Video[]; // The queue of songs
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

export default function StreamV2({
  spaceId,
  currentUserId,
  initialIsCreator,
  initialSpaceData
}: {
  spaceId: string;
  currentUserId: string;
  initialIsCreator: boolean;
  initialSpaceData: SpaceData | null;
}) {
  const [url, setUrl] = useState("");
  const [queue, setQueue] = useState<Video[]>(initialSpaceData?.streams || []);
  const [spaceData, setSpaceData] = useState<SpaceData | null>(initialSpaceData);
  const [currentSong, setCurrentSong] = useState<Video | null>(initialSpaceData?.activeStream?.song || null);
  const [nextSongTriggered, setNextSongTriggered] = useState(false);
  const [loading, setLoading] = useState(!initialSpaceData);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);

  const isHost = initialIsCreator;

  const removeCurrentSongFromDB = useCallback(async () => {
    if (!currentSong || !isHost) {
      console.warn("removeCurrentSongFromDB: No current song or not host. Skipping removal.");
      return;
    }
    try {
      await fetch(`/api/streams/remove`, {
        method: "DELETE",
        body: JSON.stringify({ spaceId: spaceId, songId: currentSong.id })
      });
    } catch (error) {
      console.error("Error removing current song:", error);
    }
  }, [currentSong, spaceId, isHost]);

  const playNext = useCallback(async () => {
    if (!isHost) return;
    console.log("playNext: Host triggered.");

    if (currentSong) {
      console.log("playNext: Host removing current song from DB.");
      await removeCurrentSongFromDB();
    }

    if (queue.length > 0) {
      console.log("playNext: Host fetching next song from API.");
      setNextSongTriggered(true);
      try {
        const res = await fetch(`/api/streams/next?spaceId=${spaceId}`, {
          method: "GET",
        });
        const json = await res.json();
        console.log("playNext: Host received next song response:", json);
      } catch (e) {
        console.error("playNext: Host ERROR playing next song:", e);
        toast.error("Failed to play next song.");
      } finally {
        setNextSongTriggered(false);
      }
    } else {
      console.log("playNext: Host: Queue is empty. Clearing current song.");
    }
  }, [isHost, currentSong, queue, removeCurrentSongFromDB, spaceId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Song URL cannot be empty");
      return;
    }
    if (!url.match(YT_REGEX)) {
      toast.error("Invalid YouTube URL format");
      return;
    }
    setLoading(true);
    try {
      const postData = streamSchema.parse({ url, hostId: currentUserId, spaceId });
      const response = await fetch(`/api/streams`, {
        method: 'POST',
        headers: { 'content-type': "application/json" },
        body: JSON.stringify(postData)
      });
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "An error occurred");

      setUrl("");
      toast.success("Song added to queue successfully");
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
    toast.success("Voted successfully");
    await fetch(`/api/streams/upvote`, {
      method: isUpvote ? "POST" : "DELETE",
      body: JSON.stringify({ songId })
    });
  };

  useEffect(() => {
    if (!initialSpaceData) {
        setLoading(true);
        const fetchInitialClientData = async () => {
            try {
                const res = await fetch(`/api/streams/?spaceId=${spaceId}`);
                const data = await res.json();
                setSpaceData(data);
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
                if (data?.activeStream?.song) {
                    setCurrentSong(data.activeStream.song);
                } else {
                    setCurrentSong(null);
                }
            } catch (error) {
                console.error("Error fetching initial client-side space data:", error);
                toast.error("Failed to load space data.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialClientData();
    } else {
        setLoading(false);
    }


    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');
    socket.emit('joinSpace', spaceId);

    socket.on('spaceUpdate', (data: SpaceData) => {
      console.log("Received spaceUpdate from Socket.io:", data);
      setSpaceData(data);
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
      if (data?.activeStream?.song) {
        setCurrentSong(data.activeStream.song);
      } else {
        setCurrentSong(null);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.io connection error:', err.message);
      toast.error('Real-time connection failed. Please refresh.');
    });

    return () => {
      socket.emit('leaveSpace', spaceId);
      socket.disconnect();
    };
  }, [spaceId, initialSpaceData]);

  useEffect(() => {
    if (isHost && !currentSong && queue.length > 0 && !nextSongTriggered) {
      playNext();
    }
  }, [isHost, currentSong, queue, nextSongTriggered, playNext]);

  useEffect(() => {
    if (!isHost || !videoPlayerRef.current) {
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
      return;
    }

    if (currentSong) {
      if (!playerInstance.current) {
        playerInstance.current = YouTubePlayer(videoPlayerRef.current, {
          videoId: currentSong.extractedId,
          host: 'https://www.youtube-nocookie.com',
          playerVars: {
            autoplay: 1,
            controls: 1,
            disablekb: 0,
            enablejsapi: 1,
            fs: 0,
            rel: 0,
            origin: window.location.origin,
            widget_referrer: window.location.origin,
          }
        });
        playerInstance.current.playVideo();

        const eventHandler = (event: { data: number }) => {
          if (event.data === 0) {
            console.log("YouTube player ended. Triggering playNext.");
            playNext();
          }
        };
        playerInstance.current.on("stateChange", eventHandler);

      } else {
        playerInstance.current.loadVideoById(currentSong.extractedId);
        playerInstance.current.playVideo();
      }
    } else {
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    }

    return () => {
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [currentSong, isHost, playNext]);


  useEffect(() => {
    if (!isHost) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isHost]);

  const highestBidInQueue = queue.reduce((max, song) => Math.max(max, song.bidAmount), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <HashLoader
          color="white"
          loading={true}
          size={70}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  if (spaceData?.spaceRunning === false) {
    return (
      <div className='flex flex-col min-h-screen items-center justify-center bg-black text-gray-100'>
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

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-100">
      <Spotlight />
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8 rounded-lg p-4">
          <SpaceHeader
            data={{
              spaceName: spaceData?.spaceName,
              spaceDesc: spaceData?.spaceDesc,
              isCreator: isHost,
              spaceId: spaceId,
            }}
          />
        </div>

        {/* Main Content - Video Player/Thumbnail and Chat Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Music Player (Host) / Current Song Info (Guest) */}
          <BackgroundGradient className="rounded p-2">
            <Card className="bg-black shadow-lg h-[calc(100vh-20rem)]">
              <CardContent className="p-6 space-y-4 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-white">Now Playing</h2>
                {currentSong ? (
                  <div className="flex-1 flex flex-col">
                    {isHost ? (
                      <div ref={videoPlayerRef} className="w-full flex-1" />
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-full max-w-sm h-40 md:h-64 rounded-md overflow-hidden mb-4">
                          <Image
                            src={currentSong.bigImg}
                            className="w-full h-full object-cover rounded-md"
                            alt={currentSong.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <p className="mt-2 text-center text-xl font-semibold text-white">
                          {currentSong.title}
                        </p>
                        <p className="text-center text-gray-400">
                          {currentSong.artist}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Playing on host&apos;s device
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">
                    No song playing, Add a song in the queue
                  </p>
                )}
                {isHost && currentSong && (
                  <Button
                    onClick={playNext}
                    disabled={nextSongTriggered}
                    className="mt-4 bg-blue-600 text-white hover:bg-blue-700 self-center"
                  >
                    {nextSongTriggered ? "Loading Next..." : "Play Next Song"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </BackgroundGradient>

          {/* Right: Chat */}
          <div className="h-[calc(103vh-20rem)]">
            <Chat spaceId={spaceId} isCreator={isHost} />
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
                        refresh={ async () => { /* No longer needed for refresh, Socket.io handles */ }}
                        currentHighestBidInSpace={highestBidInQueue}
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
    </div>
  )
}
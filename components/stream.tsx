'use client'
import React, { useEffect, useRef, useState } from 'react'
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

const REFRESH_INTERVAL_MS = 10 * 1000;

export default function Stream({
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
    try {
      await fetch(`/api/streams/remove`, {
        method: "DELETE",
        body: JSON.stringify({ spaceId: spaceId, songId: data?.activeStream?.song.id })
      });
    } catch (error) {
      console.error("Error removing current song:", error);
    }
  };

  const refresh = async () => {
    try {

      const res = await fetch(`/api/streams/?spaceId=${spaceId}`)
      const data = await res.json()
      // console.log(data);

      setData(data)


      if (data.streams && Array.isArray(data.streams)) {
        const sortedStreams = data.streams.sort((a: any, b: any) => {
          // First sort by bidAmount (highest bid first)
          if (a.bidAmount !== b.bidAmount) {
            return (b.bidAmount || 0) - (a.bidAmount || 0);
          }
          // If bids are equal or both zero, sort by upvotes (highest votes first)
          return b.upvotes - a.upvotes;
        });

        setQueue(sortedStreams);
      }
      else {
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
      // console.log(error.message);
      setQueue([]);
      setCurrentSong(null);
    } finally {
      setLoading(false)
    }
  };

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
  };

  const playNext = async () => {

    if (currentSong) {
      await removeCurrentSongFromDB();
    }

    if (queue.length > 0) {
      try {
        setNextSong(true);

        const data = await fetch(`/api/streams/next?spaceId=${spaceId}`, {
          method: "GET",
        });
        const json = await data.json();

        // Ensure we're not replaying the same song
        if (json.stream) {
          setCurrentSong(json.stream);
          setQueue((q) => q.filter((x) => x.id !== json.stream.id));
        } else {
          // If no new song, clear current song and queue
          setCurrentSong(null);
          setQueue([]);
        }
      } catch (e) {
        console.error("Error playing next song:", e);
        // Reset state if something goes wrong
        setCurrentSong(null);
        setQueue([]);
      } finally {
        setNextSong(false);
      }
    } else {
      // If queue is empty, clear the current song
      setCurrentSong(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast.error("Song url cannot cannot be empty")
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
      console.log(data);

      if (!response.ok)
        throw new Error(data.message || "An error occured")

      setQueue([...queue, data])
      setUrl("")
      toast.success("song added to queue successfully")
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

    // setQueue(
    //   queue.map((song) => song.id === songId ? {
    //     ...song,
    //     upvotes: isUpvote ? song.upvotes + 1 : song.upvotes - 1,
    //     haveUpvoted: !song.haveUpvoted
    //   } : song).sort((a, b) => b.upvotes - a.upvotes)
    // )

    await fetch(`/api/streams/upvote`, {
      method: isUpvote ? "POST" : "DELETE",
      body: JSON.stringify({ songId })
    })
    refresh()

  };



  useEffect(() => {
    if (!currentSong && queue.length > 0 && !nextSong) {
      playNext();
    }
  }, [currentSong, queue, nextSong]);


  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [spaceId]);


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
        // Song ended, play next
        playNext();
      }
    };
    player.on("stateChange", eventHandler);

    return () => {
      player.destroy();
    };
  }, [currentSong, videoPlayer]);


  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with more space */}
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-8">
            {/* Song URL Input */}
            <div className="space-y-4 rounded-lg p-4">
              <div className="space-y-2">
                <label htmlFor="song-url" className="block text-sm font-medium text-gray-400">
                  Song URL
                </label>
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <Input
                    id="song-url"
                    placeholder="Enter song URL here"
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 flex-grow"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />

                  <Button disabled={loading} type="submit" className="bg-purple-600 text-white hover:bg-purple-700">
                    {loading ? "adding..." : "Add to Queue"}
                  </Button>
                </form>
                <CardContent>
                  {url && url.match(YT_REGEX) && !loading && (
                    <div className="mt-4">
                      <LiteYouTubeEmbed
                        title=""
                        id={url.split("?v=")[1]}
                      />

                      <p>YouTube Preview</p>

                    </div>
                  )}
                </CardContent>
              </div>
            </div>

            {/* Now Playing */}
            <Card className="bg-gray-800  shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-white">Now Playing</h2>
                {currentSong ? (
                  <div>
                    {playVideo ? (
                      <div
                        ref={videoPlayer}
                        className="w-full aspect-video"
                      // style={{ pointerEvents: 'none' }}
                      />
                    ) : (
                      <>
                        <Image
                          src={currentSong.bigImg}
                          className="w-full aspect-video object-cover rounded-md"
                          alt={currentSong.title}
                          width={1920}
                          height={1080}
                        />
                        <p className="mt-2 text-center font-semibold text-white">
                          {currentSong.title}
                        </p>
                        <p className="mt-2 text-center font-semibold text-white">
                          {currentSong.artist}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">
                    No song playing, Add a song in the queue
                  </p>
                )}
              </CardContent>
            </Card>

            {/* <Queue queue={queue}/> */}
            {/* Queue */}
            <div className="w-full  rounded-lg p-4">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Next Up in Queue</h3>
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
                          className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:bg-gray-750 transition-colors duration-200 flex-shrink-0 w-64"
                        >
                          <div className="p-4 flex flex-col">
                            <Image
                              width={60}
                              height={60}
                              alt={`${song.title} thumbnail`}
                              src={song.smallImg}
                              className="w-full h-40 object-cover rounded-md mb-3"
                            />
                            <div className="mb-3">
                              <p className="font-medium text-lg truncate">{song.title}</p>
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

                                {/* <span>current bid: {" "} </span> */}
                                {/* <Button variant="outline" size="sm" className="bg-transparent text-amber-400 border border-amber-500/50">
                   
                                {song.bidAmount}
                              </Button> */}
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
                          <BidSolana songId={song.id} spaceId={spaceId} refresh={refresh} />
                        </div>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="h-[calc(100vh-10rem)]  rounded-lg p-4">
            <Chat spaceId={spaceId} isCreator={data?.isCreator as boolean} />

          </div>

        </div>
        <BackgroundBeams/>
      </div>
    </div>
  )
}

import { auth } from "@/auth";
import { YT_REGEX } from "@/lib/utils";
import { streamSchema } from "@/schema";
import { PrismaClient } from '@prisma/client';
import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

const prisma = new PrismaClient();



export async function POST(req: NextRequest) {
  const session = await auth();
  const defaultThumbnail = "/song-static.jpg"; 
  try {
    const host = await prisma.user.findUnique({
      where: { email: session?.user?.email || "" },
      select: { id: true },
    });

    const body = streamSchema.parse(await req.json());
    const { hostId, url, spaceId } = body;

    if (!url.trim()) {
      return NextResponse.json(
        { message: "YouTube link cannot be empty" },
        { status: 400 }
      );
    }

    const extractedId = url.match(YT_REGEX)?.[1];
    if (!extractedId) {
      return NextResponse.json(
        { message: "Invalid YouTube URL format" },
        { status: 400 }
      );
    }
    console.log("trying to fetch video details");



    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet',
          id: extractedId,
          key: process.env.YT_API_KEY,
        },

      }
    );

    const video = response.data.items[0]?.snippet;


    const newSong = await prisma.song.create({
      data: {
        userId: hostId,
        url,
        artist: video.channelTitle ?? "Unknown",
        spaceId,
        extractedId,
        smallImg: video.thumbnails.standard?.url || defaultThumbnail,
        bigImg: video.thumbnails.high?.url || defaultThumbnail,
        title: video.title ?? "Unknown title",
        addedBy: host?.id || "",
      },
    });

    return NextResponse.json({
      ...newSong,
      hasUpvoted: false,
      upvotes: 0,
    });

  } catch (error: any) {
    console.error("Error in song creation:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to retrieve space information" },
      { status: 403 }
    );
  }
  try {
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    // const user = session.user
    if (!spaceId) {
      return NextResponse.json({
        message: "Error"
      }, {
        status: 411
      })
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session?.user?.email || "",
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    const [space, activeStream] = await Promise.all([

      prisma.space.findUnique({
        where: {
          id: spaceId,
        },
        include: {
          songs: {
            include: {
              _count: {
                select: {
                  votes: true
                }
              },
              votes: {
                where: {
                  userId: user.id
                }
              }

            },
            where: {
              played: false
            }
          },
          _count: {
            select: {
              songs: true
            }
          },

        }

      }),
      prisma.currentSong.findFirst({
        where: {
          spaceId: spaceId
        },
        include: {
          song: true
        }
      }),

    ]);

    const spaceRunning = await prisma.song.findFirst({
      where: {
        id: spaceId
      },
      select: {
        spaceRunning: true
      }
    })
    console.log(spaceRunning);


    const hostId = space?.hostId;
    const isCreator = user?.id === hostId

    return NextResponse.json({
      streams: space?.songs.map(({ _count, ...rest }) => ({
        ...rest,
        upvotes: _count.votes,
        haveUpvoted: rest.votes.length ? true : false

      })),
      activeStream,
      hostId,
      isCreator,
      spaceName: space?.name,
      spaceDesc: space?.description,
      spaceRunning
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ error: "Something went wrong" }, { status: 501 })
  }
}


export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { spaceId } = body
  console.log(spaceId);

  if (!spaceId) {
    return NextResponse.json({
      success: false,
      message: "Space ID is required"
    }, { status: 400 })
  }

  try {
    // Delete related votes first
    // await prisma.vote.deleteMany({
    //   where: {
    //     song: {
    //       spaceId: spaceId
    //     }
    //   }
    // })

    // // Delete current song reference
    // await prisma.currentSong.deleteMany({
    //   where: {
    //     spaceId: spaceId
    //   }
    // })

    // // Delete songs associated with the space
    // await prisma.song.deleteMany({
    //   where: {
    //     spaceId: spaceId
    //   }
    // })

    // Finally, delete the space
    await prisma.space.delete({
      where: {
        id: spaceId
      }
    })

    // await prisma.song.update({
    //   where: {
    //     id: spaceId
    //   }, data: {
    //     spaceRunning: false
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: "Space and all associated data deleted successfully"
    }, { status: 200 })
  } catch (error) {
    console.error("Error deleting space:", error)

    return NextResponse.json({
      success: false,
      message: "Something went wrong while deleting the space",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to retrieve space information" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email || "",
    },
    select: {
      id: true,
    },
  });
  if (!user)
    return NextResponse.json(
      { success: false, message: "You must be logged in to retrieve space information" },
      { status: 401 }
    );
  try {
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    if (!spaceId)
      return NextResponse.json({ success: false, message: "no song found in the queue" }, { status: 404 })


    const mostBiddedSong = await prisma.song.findFirst({
      where: {
        spaceId: spaceId,
        played: false,
        userId: user?.id
      },
      orderBy: {
        bidAmount: 'desc'
      }
    })
    console.log(mostBiddedSong);
    
    const mostVotedSong = await prisma.song.findFirst({
      where: {
        spaceId: spaceId,
        played: false,
        userId: user?.id
      },
      orderBy: {
        votes: {
          _count: 'desc'
        }
      }
    })


    await Promise.all([
      prisma.currentSong.upsert({
        where: {
          spaceId: spaceId as string
        },
        update: {
          userId: user.id,
          songId: mostVotedSong?.id,
          spaceId: spaceId
        },
        create: {
          userId: session.user.id,
          songId: mostVotedSong?.id,
          spaceId: spaceId
        },
      })
      ,
      prisma.song.update({
        where: {
          id: mostVotedSong?.id ?? "",
        },
        data: {
          played: true,
          playedTs: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      stream: mostVotedSong,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Something went wrong", error: error.message }, { status: 501 })
  }

}
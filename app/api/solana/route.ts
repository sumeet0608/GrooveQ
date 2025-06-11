import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
        where: { email: session?.user?.email ?? "" },
    });

    if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { songId, newAmount:amount } = await req.json()
    console.log(amount);
    
    const bidAmount = Number(amount);
    if (isNaN(bidAmount)) {
        return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    console.log('Processing bid:', bidAmount, songId);


    try {
        await prisma.song.update({
            where:{id:songId},
            data: {
                bidAmount
            },
        });
        return NextResponse.json("done");

    } catch (e: any) {
        console.log(e);
        
        return NextResponse.json(
            {
                message: "Error while bidding", error: e.message
            },
            {
                status: 403,
            },
        );
    }
}

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
        where: { email: session?.user?.email ?? "" },
    });

    if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const spaceId = req.nextUrl.searchParams.get("spaceId");
    console.log(spaceId);
    
    if(!spaceId){
        return NextResponse.json({ success: false, error: 'spaceId not found' }, { status: 404 });
    }

    const mostBiddedSong = await prisma.song.findFirst({
        where: {
          spaceId: spaceId,
          played: false,
        //   userId: user?.id
        },
        orderBy: {
          bidAmount: 'desc'
        }
    })
    console.log(mostBiddedSong);


    return NextResponse.json(mostBiddedSong?.bidAmount);



}
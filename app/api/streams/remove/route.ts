
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { songId, spaceId } = body;

        console.log("DELETE API: Attempting to remove song.");
        console.log("DELETE API: Received songId:", songId);
        console.log("DELETE API: Received spaceId:", spaceId);

        await prisma.song.delete({
            where: { 
                id: songId,
                spaceId: spaceId 
            }
        });

        console.log(`DELETE API: Song ${songId} removed successfully from space ${spaceId}.`);

        return NextResponse.json(
            { message: 'Song removed successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error("DELETE API: Error removing song:");
        console.error(error);
        return NextResponse.json(
            { message: 'Error removing song' },
            { status: 500 }
        );
    }
}
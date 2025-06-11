import { auth } from "@/auth";
import { upvoteSchema } from "@/schema";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

    const session = await auth();
    console.log(session);
    
    if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, message: "You must be logged in to retrieve space information" },
          { status: 401 }
        );
      }

      try {
        const username = session.user.name
        const user= await prisma.user.findUnique({
          where: {
              email: session?.user?.email || "",
          },
          select: {
            id: true,
          },
        });
        if(!user) {
          return NextResponse.json(
            {
              message: "User not found",
            },
            {
              status: 404,
            },
          );
        }

        
        const body = upvoteSchema.parse(await req.json());
        const { songId} = body;

        
        await prisma.vote.create({
          data: {
            userId: user?.id,
            songId: songId,

          },
        });
        return NextResponse.json({
          message: "Done!",
        });
      } catch (e:any) {
        // console.log(e);
        
        return NextResponse.json(
          {
            message: "Error while upvoting",error:e.message
          },
          {
            status: 403,
          },
        );
      }
}



export async function DELETE(req: NextRequest){
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "You must be logged in to retrieve space information" },
      { status: 401 }
    );
  }
  const username = session.user.name
        const user= await prisma.user.findUnique({
          where: {
              email: session?.user?.email || "",
          },
          select: {
            id: true,
          },
        });
        if(!user) {
          return NextResponse.json(
            {
              message: "User not found",
            },
            {
              status: 404,
            },
          );
        }


  const body = upvoteSchema.parse(await req.json());
  const { songId} = body;
  console.log(user.id);
  

  try {
    await prisma.vote.delete({
      where:{
        userId_songId: {
          userId: user.id,
          songId: songId
        },
      },
    });
    return NextResponse.json({message:"Downvoted successfully"});
  } catch (error:any) {
    return NextResponse.json(
      {
        message: "Error while downvoting",error:error.message
      },
      {
        status: 403,
      },
    );

    
  }


}
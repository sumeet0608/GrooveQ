import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";


const prisma = new PrismaClient()

export async function GET() {

    const session = await auth();
    
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }

    try {
        console.log(session.user.email);
        
        const user = await prisma.user.findUnique({
          where: { email: session?.user?.email ?? "" },
          include: { hostedSpaces: true },
        });
    
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }
    
        
        if (user.hostedSpaces.length > 0) {
          console.log("space exisits");
          
          return NextResponse.json({ success: true, spaceId: user.hostedSpaces[0].id }, { status: 200 });

        } else {
            return NextResponse.json({ success: false, message:"no space found" }, { status: 404 });
        }
    
      } catch (e:any) {
        return NextResponse.json({ success: false, err:"Something went wrong",e }, { status: 500 });
      }
}
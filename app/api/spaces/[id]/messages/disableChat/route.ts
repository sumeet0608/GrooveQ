import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const chat = await prisma.space.findFirst({
        where:{id:id},
        select:{chatDisabled:true}
    })

    console.log(chat);
    

    
    return NextResponse.json(chat)

}




export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const body = await req.json()
    console.log("body = ",body);
    

    const res = await prisma.space.update({
        where:{
            id:id
        },data:{
            chatDisabled:body.disableChat===false?true:false
        },select:{chatDisabled:true}
    })
    console.log(res);
    
    return NextResponse.json(res)
}
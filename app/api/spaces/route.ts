
import { auth } from '@/auth';
import { spaceSchema } from '@/schema';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/dist/server/api-utils';

import { NextRequest, NextResponse } from 'next/server';


const prisma = new PrismaClient();

export async function POST(request: Request) {

    const session = await auth();
    console.log("session is - ",session);
    
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
    }
    try {
        
        const body = await request.json();
        const { name, description } = spaceSchema.parse(body)
        
        const host = await prisma.user.findUnique({
            where: {
                email: session?.user?.email || "",
            },
            select: {
              id: true,
            },
          });
        console.log("host id",host?.id) ; 
        

        

        const space = await prisma.space.create({

            data: {
                name:name,
                description:description,
                hostId:host?.id || "",
            },
        });
        const url = `/spaces/${space.id}`; 
        
        const updatedSpace = await prisma.space.update({
            where: {
                id: space.id,
            },
            data: {
                url: url,  
            },
        });

               

        return NextResponse.json({ success: true,message:"space created successfully", updatedSpace,redirect:url }, { status: 201 });
    } catch (error) {
        console.error('Error creating space:', error);
        NextResponse.json({ success: false, error: 'Error creating space' }, { status: 500 });
    }
}


export async function GET(req:NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, message: "You must be logged in to retrieve space information" },
          { status: 401 }
        );
      }
    try {
        const { searchParams } = new URL(req.url);
        const spaceId = searchParams.get('spaceId');
        const userId = session.user.id;
        console.log(userId);
        

        if(!spaceId){
            return NextResponse.json({ success: false, error: 'spaceId is required' }, { status: 400 });
        }
        
        const space = await prisma.space.findUnique({
            where: {
                id:spaceId
            },
            select: {
                name: true,
                description: true,
                hostId:true
            },
        })
        if(!space)
            return NextResponse.json({success:false,message:"space not found"},{status:404});
        
        
        return NextResponse.json({success:true,message:"space found",space,userId: userId},{status:200});
    } catch (error) {
        console.error('Error creating space:', error);
        NextResponse.json({ success: false, message: 'Error fetching space' }, { status: 500 });
    }
}
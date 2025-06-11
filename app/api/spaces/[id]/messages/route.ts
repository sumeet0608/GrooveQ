import { NextRequest, NextResponse } from 'next/server';


import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'User not authenticated' }, { status: 401 });
        }

        const { id } = await params;

        // const data = await prisma.space.findFirst({
        //     where:{id},
        //     select:{chatDisabled:true}
        // })
        
        // if(data?.chatDisabled === true){
        //     return NextResponse.json({message:"chat disabled"},{status:200})
        // }

        const space = await prisma.space.findUnique({
            where: { id },
        });

        if (!space) {
            return NextResponse.json({ error: 'Space not found' }, { status: 404 });
        }

        const url = new URL(req.url);
        const lastTimestamp = url.searchParams.get('lastTimestamp');


        const lastMessageDate = lastTimestamp ? new Date(lastTimestamp) : undefined;


        const filter = lastMessageDate
            ? {
                spaceId:id,
                createdAt: {
                    gt: lastMessageDate,
                },
            }
            : { spaceId :id };

        const waitTime = 30000;
        const startTime = Date.now();

        let messages = [];

        do {
            messages = await prisma.message.findMany({
                where:{
                    ...filter,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
                take: 50,
            });

            // console.log("message -", messages);

            if (messages.length > 0 || Date.now() - startTime > waitTime) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } while (true);

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Send a new message
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session?.user?.email ?? "" },
            include: { hostedSpaces: true },
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const { id } = await params;
        const { content } = await req.json();

        const data = await prisma.space.findFirst({
            where:{id},
            select:{chatDisabled:true}
        })

        if(data?.chatDisabled === true){
            return NextResponse.json({message:"chat disabled"},{status:200})
        }

        // Validate request body
        if (!content || typeof content !== 'string') {
            return NextResponse.json({ error: 'Invalid message content' }, { status: 400 });
        }

        // Check if space exists
        const space = await prisma.space.findUnique({
            where: { id },
        });

        if (!space) {
            return NextResponse.json({ error: 'Space not found' }, { status: 404 });
        }

        // Get user ID from session
        const userId = user.id;


        // Create the message
        const message = await prisma.message.create({
            data: {
                content,
                userId,
                spaceId: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        
        

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
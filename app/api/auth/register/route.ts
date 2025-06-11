

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'
import { RegisterSchema } from "@/schema";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    
    const body = await request.json();

    
    const { email, password, name } = RegisterSchema.parse(body);
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

 
    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ 
      user: { id: user.id, email: user.email, username: user.name } 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

const requestSchema = z.object({
  message: z.string().min(10, "Message is required").max(500),
});


export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const existing = await prisma.adminRequest.findFirst({
    where: { userId: user.id },
  });

  if (existing) {
    return NextResponse.json({ error: "Request already exists" }, { status: 400 });
  }

  const request = await prisma.adminRequest.create({
    data: {
      userId: user.id,
      message: parsed.data.message || "",
    },
  });

  return NextResponse.json({ success: true, request });
}

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.adminRequest.findFirst({
    where: { userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ exists: false }, { status: 200 });
  }

  return NextResponse.json({ exists: true, status: existing.status });
}

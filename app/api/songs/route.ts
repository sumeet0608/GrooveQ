import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const songSchema = z.object({
  youtubeUrl: z.string().url().regex(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/, {
    message: "Invalid YouTube URL",
  }),
  title: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  const body = await req.json();
  const parsed = songSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid song data" }, { status: 400 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const latestSession = await prisma.session.findFirst({
    where: { expiresAt: { gt: new Date() } }, // only unexpired
    orderBy: { createdAt: "desc" },
  });

  if (!latestSession) {
    return NextResponse.json({ error: "No active session" }, { status: 400 });
  }

  // ❌ Check if user is blocked in this session
  const isBlocked = await prisma.blockedUser.findUnique({
    where: {
      sessionId_email: {
        sessionId: latestSession.id,
        email: user.email,
      },
    },
  });

  if (isBlocked) {
    return NextResponse.json({ error: "You are blocked from adding songs" }, { status: 403 });
  }

  // ⏳ Rate limit: check how many songs added in past hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const addedCount = await prisma.song.count({
    where: {
      addedById: user.id,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (addedCount >= 7) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const song = await prisma.song.create({
    data: {
      sessionId: latestSession.id,
      title: parsed.data.title,
      youtubeUrl: parsed.data.youtubeUrl,
      addedById: user.id,
    },
  });

  return NextResponse.json({ success: true, song });
}

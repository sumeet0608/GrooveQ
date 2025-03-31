import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not an admin" }, { status: 403 });
  }

  // Get the latest session created by this admin
  const latestSession = await prisma.session.findFirst({
    where: { adminId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latestSession) {
    return NextResponse.json({ songs: [] });
  }

  const songs = await prisma.song.findMany({
    where: { sessionId: latestSession.id },
    include: {
      addedBy: {
        select: { name: true, email: true },
      },
    },
    orderBy: { upvotes: "desc" },
  });

  return NextResponse.json({ songs });
}

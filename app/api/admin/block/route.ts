import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const latestSession = await prisma.session.findFirst({
    where: { adminId: admin.id },
    orderBy: { createdAt: "desc" },
  });

  if (!latestSession) {
    return NextResponse.json({ error: "No active session" }, { status: 400 });
  }

  await prisma.blockedUser.upsert({
    where: {
      sessionId_email: {
        sessionId: latestSession.id,
        email: parsed.data.email,
      },
    },
    update: {},
    create: {
      sessionId: latestSession.id,
      email: parsed.data.email,
    },
  });

  return NextResponse.json({ success: true });
}

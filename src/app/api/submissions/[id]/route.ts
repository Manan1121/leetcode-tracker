import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!submission || submission.userId !== session.user.id) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    await prisma.submission.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to delete submission:", error);
    return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
  }
}

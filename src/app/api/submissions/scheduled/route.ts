import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

interface SessionWithUser {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export async function GET() {
  const session = await getServerSession(authOptions) as SessionWithUser | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all submissions with future review dates
    const submissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
        nextReviewDate: {
          not: null
        }
      },
      include: {
        problem: true
      },
      orderBy: {
        nextReviewDate: 'asc'
      }
    });
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch scheduled reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SpacedRepetition } from "@/lib/spaced-repetition";

const prisma = new PrismaClient();

interface SessionWithUser {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
}

// GET problems due for review
export async function GET() {
  const session = await getServerSession(authOptions) as SessionWithUser | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const dueSubmissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { nextReviewDate: { lte: now } },
          {
            AND: [
              { nextReviewDate: null },
              { solvedAt: { lte: oneDayAgo } }
            ]
          }
        ]
      },
      include: {
        problem: true,
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { nextReviewDate: 'asc' }
    });
    
    return NextResponse.json(dueSubmissions);
  } catch (error) {
    console.error('Failed to fetch due reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST mark problem as reviewed
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions) as SessionWithUser | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { submissionId, difficulty, timeSpent, notes } = body;
    
    // Get current submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId }
    });
    
    if (!submission || submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    
    // Calculate next review date
    const { interval, easeFactor, nextReviewDate } = SpacedRepetition.calculate(
      submission.reviewCount,
      submission.easeFactor,
      submission.interval,
      difficulty
    );
    
    // Create review record
    const review = await prisma.review.create({
      data: {
        submissionId,
        difficulty,
        timeSpent,
        notes
      }
    });
    
    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        lastReviewedAt: new Date(),
        nextReviewDate,
        reviewCount: { increment: 1 },
        easeFactor,
        interval
      },
      include: {
        problem: true,
        reviews: true
      }
    });
    
    return NextResponse.json({
      submission: updatedSubmission,
      review,
      nextReview: {
        date: nextReviewDate,
        daysUntil: interval
      }
    });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// GET user's submissions
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        problem: true,
      },
      orderBy: {
        solvedAt: 'desc',
      },
    });
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// POST new submission
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      problemId, 
      title, 
      titleSlug, 
      difficulty,
      timeSpent,
      personalDifficulty,
      notes,
      solution,
      language 
    } = body;

    // First, upsert the problem (create if doesn't exist)
    const problem = await prisma.problem.upsert({
      where: { id: problemId },
      update: {},
      create: {
        id: problemId,
        title,
        titleSlug,
        difficulty,
      },
    });

    // Then create or update the submission for this user
    const submission = await prisma.submission.upsert({
      where: {
        userId_problemId: {
          userId: session.user.id,
          problemId: problem.id,
        },
      },
      update: {
        timeSpent,
        personalDifficulty,
        notes,
        solution,
        language: language || 'javascript',
        solvedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        problemId: problem.id,
        timeSpent,
        personalDifficulty,
        notes,
        solution,
        language: language || 'javascript',
      },
      include: {
        problem: true,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Failed to create submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all submissions
export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
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

    // Then create the submission
    const submission = await prisma.submission.create({
      data: {
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
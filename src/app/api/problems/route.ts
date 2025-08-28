import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all problems
export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        submissions: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    
    return NextResponse.json(problems);
  } catch (error) {
    console.error('Failed to fetch problems:', error);
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}
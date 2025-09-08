import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '@/lib/email/service';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Security: Verify this is from your cron service
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // For development, allow without secret
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting email reminder cron job...');
    
    // Find all users with due reviews
    const usersWithDueReviews = await prisma.user.findMany({
      where: {
        emailNotifications: true,
        submissions: {
          some: {
            nextReviewDate: {
              lte: new Date()
            }
          }
        }
      },
      include: {
        submissions: {
          where: {
            nextReviewDate: {
              lte: new Date()
            }
          },
          include: {
            problem: true
          }
        }
      }
    });

    console.log(`Found ${usersWithDueReviews.length} users with due reviews`);

    // Send emails
    let emailsSent = 0;
    let emailsFailed = 0;
    const results = [];

    for (const user of usersWithDueReviews) {
      if (user.submissions.length > 0) {
        try {
          const sent = await EmailService.sendReviewReminder(
            user.id, 
            user.submissions
          );
          
          if (sent) {
            emailsSent++;
            results.push({
              userId: user.id,
              email: user.email,
              problems: user.submissions.length,
              status: 'sent'
            });
          } else {
            emailsFailed++;
            results.push({
              userId: user.id,
              email: user.email,
              problems: user.submissions.length,
              status: 'failed'
            });
          }
        } catch (error) {
          emailsFailed++;
          console.error(`Failed to send email to ${user.email}:`, error);
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      summary: {
        usersProcessed: usersWithDueReviews.length,
        emailsSent,
        emailsFailed,
        timestamp: new Date().toISOString()
      },
      results
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ 
      error: 'Failed to send reminders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also support POST for some cron services
export async function POST(request: Request) {
  return GET(request);
}
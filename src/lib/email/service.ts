import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import { SubmissionWithProblem, EmailMetadata } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);
const prisma = new PrismaClient();

export class EmailService {
  static async sendReviewReminder(
    userId: string,
    problems: SubmissionWithProblem[]
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user || !user.emailNotifications) {
        return false;
      }
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
              .content { background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px; }
              .problem-card { background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .difficulty-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
              .easy { background: #d4edda; color: #155724; }
              .medium { background: #fff3cd; color: #856404; }
              .hard { background: #f8d7da; color: #721c24; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🧠 Time for LeetCode Review!</h1>
                <p>You have ${problems.length} problem${problems.length > 1 ? 's' : ''} ready for review</p>
              </div>
              <div class="content">
                <p>Hi ${user.name || 'there'}!</p>
                <p>It's time to review these problems to strengthen your memory:</p>
                
                ${problems.map(p => `
                  <div class="problem-card">
                    <h3>${p.problem.id}. ${p.problem.title}</h3>
                    <span class="difficulty-badge ${['easy', 'medium', 'hard'][p.problem.difficulty - 1]}">
                      ${['Easy', 'Medium', 'Hard'][p.problem.difficulty - 1]}
                    </span>
                    <p><strong>Last reviewed:</strong> ${p.lastReviewedAt ? new Date(p.lastReviewedAt).toLocaleDateString() : 'Never'}</p>
                    <p><strong>Review count:</strong> ${p.reviewCount} times</p>
                    ${p.notes ? `<p><em>Your notes: ${p.notes.substring(0, 100)}...</em></p>` : ''}
                  </div>
                `).join('')}
                
                <center>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                    Review Now →
                  </a>
                </center>
                
                <div class="footer">
                  <p>💡 Tip: Try to solve each problem without looking at your previous solution first!</p>
                  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Manage email preferences</a></p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: user.email,
        subject: `🧠 ${problems.length} LeetCode problem${problems.length > 1 ? 's' : ''} to review`,
        html,
      });
      
      // Check if email was sent successfully
      if (result.error) {
        console.error('Resend error:', result.error);
        
        // Log failure
        const errorMetadata: EmailMetadata = { 
          error: result.error.message || 'Unknown error'
        };
        
        await prisma.emailLog.create({
          data: {
            userId,
            type: 'review_reminder',
            status: 'failed',
          }
        });
        
        return false;
      }
      
      // Log success
      const metadata: EmailMetadata = { 
        problemCount: problems.length, 
        emailId: result.data?.id || 'unknown'
      };
      
      await prisma.emailLog.create({
        data: {
          userId,
          type: 'review_reminder',
          status: 'sent',
       }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // Log failure
      const errorMetadata: EmailMetadata = { 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      await prisma.emailLog.create({
        data: {
          userId,
          type: 'review_reminder',
          status: 'failed',
        }
      });
      
      return false;
    }
  }
  
  /**
   * Send weekly summary email
   */
  static async sendWeeklySummary(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          submissions: {
            where: {
              solvedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
              }
            },
            include: {
              problem: true
            }
          }
        }
      });
      
      if (!user || !user.emailNotifications || user.submissions.length === 0) {
        return false;
      }
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
              .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
              .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
              .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Your Weekly LeetCode Summary</h1>
                <p>Great work this week, ${user.name || 'there'}!</p>
              </div>
              
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number">${user.submissions.length}</div>
                  <div class="stat-label">Problems Solved</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${user.submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0)}</div>
                  <div class="stat-label">Minutes Spent</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${user.submissions.filter(s => s.reviewCount > 0).length}</div>
                  <div class="stat-label">Problems Reviewed</div>
                </div>
              </div>
              
              <p>Keep up the great work! Consistency is key to mastering algorithms.</p>
            </div>
          </body>
        </html>
      `;
      
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: user.email,
        subject: `📊 Your Weekly LeetCode Summary - ${user.submissions.length} problems solved!`,
        html,
      });
      
      if (result.error) {
        console.error('Failed to send weekly summary:', result.error);
        return false;
      }
      
      // Log success
      await prisma.emailLog.create({
        data: {
          userId,
          type: 'weekly_summary',
          status: 'sent',
          metadata: { 
            problemCount: user.submissions.length,
            emailId: result.data?.id || 'unknown'
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to send weekly summary:', error);
      return false;
    }
  }
}
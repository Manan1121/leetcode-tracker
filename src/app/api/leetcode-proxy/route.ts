import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch from LeetCode API
    const response = await fetch('https://leetcode.com/api/problems/algorithms/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // Cache for 1 hour
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from LeetCode');
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('LeetCode API error:', error);
    
    // Return sample data for development if API fails
    return NextResponse.json({
      stat_status_pairs: [
        {
          stat: {
            question_id: 1,
            question__title: "Two Sum",
            question__title_slug: "two-sum",
            frontend_question_id: 1,
            total_acs: 1000000,
            total_submitted: 2000000
          },
          difficulty: { level: 1 },
          paid_only: false
        }
      ],
      num_total: 3000,
      num_solved: 0
    });
  }
}
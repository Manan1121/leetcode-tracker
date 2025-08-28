import axios from 'axios';

interface LeetCodeProblem {
  stat: {
    question_id: number;
    question__title: string;
    question__title_slug: string;
    frontend_question_id: number;
    total_acs: number;
    total_submitted: number;
  };
  difficulty: {
    level: number;
  };
  paid_only: boolean;
}

interface LeetCodeResponse {
  stat_status_pairs: LeetCodeProblem[];
  num_total: number;
  num_solved: number;
}

class LeetCodeService {
  private problems: LeetCodeProblem[] = [];
  private lastFetched: Date | null = null;
  private CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  async fetchProblems(): Promise<LeetCodeProblem[]> {
    // Check cache
    if (this.lastFetched && 
        Date.now() - this.lastFetched.getTime() < this.CACHE_DURATION && 
        this.problems.length > 0) {
      return this.problems;
    }

    try {
      // Note: In production, you might need to proxy this through your API
      // to avoid CORS issues
      const response = await axios.get<LeetCodeResponse>(
        '/api/leetcode-proxy' // We'll create this endpoint
      );
      
      this.problems = response.data.stat_status_pairs;
      this.lastFetched = new Date();
      
      return this.problems;
    } catch (error) {
      console.error('Failed to fetch LeetCode problems:', error);
      // Return cached data if available
      return this.problems;
    }
  }

  async searchProblem(query: string): Promise<LeetCodeProblem | null> {
    const problems = await this.fetchProblems();
    
    // Search by number or title
    const problem = problems.find(p => {
      const titleMatch = p.stat.question__title
        .toLowerCase()
        .includes(query.toLowerCase());
      const slugMatch = p.stat.question__title_slug
        .toLowerCase()
        .includes(query.toLowerCase());
      const idMatch = p.stat.frontend_question_id.toString() === query;
      
      return titleMatch || slugMatch || idMatch;
    });

    return problem || null;
  }
}

export const leetcodeService = new LeetCodeService();
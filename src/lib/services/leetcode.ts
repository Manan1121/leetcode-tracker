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
      const response = await fetch('/api/leetcode-proxy');
      const data: LeetCodeResponse = await response.json();
      
      this.problems = data.stat_status_pairs || [];
      this.lastFetched = new Date();
      
      return this.problems;
    } catch (error) {
      console.error('Failed to fetch LeetCode problems:', error);
      return this.problems;
    }
  }

  async searchProblem(query: string): Promise<LeetCodeProblem | null> {
    const problems = await this.fetchProblems();
    
    if (!problems || problems.length === 0) {
      return null;
    }

    // Clean the query
    const cleanQuery = query.trim().toLowerCase();
    
    // First, check if it's a number (for direct problem ID search)
    const queryAsNumber = parseInt(cleanQuery);
    if (!isNaN(queryAsNumber)) {
      // Search by frontend_question_id (the problem number users see)
      const problemById = problems.find(p => p.stat.frontend_question_id === queryAsNumber);
      if (problemById) {
        return problemById;
      }
    }
    
    // If not found by ID or not a number, search by title/slug
    const problem = problems.find(p => {
      const title = p.stat.question__title.toLowerCase();
      const slug = p.stat.question__title_slug.toLowerCase();
      
      return title.includes(cleanQuery) || slug.includes(cleanQuery);
    });

    return problem || null;
  }
}

export const leetcodeService = new LeetCodeService();
export type { LeetCodeProblem };
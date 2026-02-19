'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowUpRight, Loader2, Search, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { leetcodeService, type LeetCodeProblem } from '@/lib/services/leetcode';
import { SUGGESTED_PROBLEMS } from '@/lib/suggested-problems';

export function ProblemSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [foundProblem, setFoundProblem] = useState<LeetCodeProblem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [solvedProblemIds, setSolvedProblemIds] = useState<number[]>([]);
  const [difficultyCoverage, setDifficultyCoverage] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  const [formData, setFormData] = useState({
    timeSpent: '30',
    personalDifficulty: '3',
    notes: '',
    solution: '',
    language: 'javascript',
  });

  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const response = await fetch('/api/submissions');
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const submissions = await response.json();
        const solvedIds: number[] = submissions.map((submission: { problem: { id: number } }) => submission.problem.id);
        setSolvedProblemIds(solvedIds);

        setDifficultyCoverage({
          easy: submissions.filter((submission: { problem: { difficulty: number } }) => submission.problem.difficulty === 1).length,
          medium: submissions.filter((submission: { problem: { difficulty: number } }) => submission.problem.difficulty === 2).length,
          hard: submissions.filter((submission: { problem: { difficulty: number } }) => submission.problem.difficulty === 3).length,
        });
      } catch (error) {
        console.error('Failed to load suggestions context:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSolvedProblems();
  }, []);

  const recommendedDifficulty = useMemo<1 | 2 | 3>(() => {
    const levels = [
      { level: 1 as const, count: difficultyCoverage.easy },
      { level: 2 as const, count: difficultyCoverage.medium },
      { level: 3 as const, count: difficultyCoverage.hard },
    ];

    levels.sort((a, b) => a.count - b.count);
    return levels[0].level;
  }, [difficultyCoverage]);

  const personalizedSuggestions = useMemo(() => {
    const solvedSet = new Set(solvedProblemIds);
    const unsolved = SUGGESTED_PROBLEMS.filter((problem) => !solvedSet.has(problem.id));

    return unsolved
      .sort((a, b) => {
        const aScore = a.difficulty === recommendedDifficulty ? 0 : 1;
        const bScore = b.difficulty === recommendedDifficulty ? 0 : 1;
        if (aScore !== bScore) return aScore - bScore;
        return a.id - b.id;
      })
      .slice(0, 6);
  }, [recommendedDifficulty, solvedProblemIds]);

  const handleSearch = async (providedQuery?: string) => {
    const searchTerm = (providedQuery ?? query).trim();
    if (!searchTerm) {
      toast.error('Enter a problem name or number');
      return;
    }

    setQuery(searchTerm);
    setIsSearching(true);
    try {
      const problem = await leetcodeService.searchProblem(searchTerm);
      if (!problem) {
        toast.error('Problem not found. Try another title or number.');
        setFoundProblem(null);
        setShowForm(false);
        return;
      }

      setFoundProblem(problem);
      setShowForm(true);
      toast.success(`Found: ${problem.stat.question__title}`);
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestedProblemClick = async (problemId: number) => {
    await handleSearch(problemId.toString());
  };

  const handleSearchClick = () => {
    void handleSearch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundProblem) {
      toast.error('Search for a problem first');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: foundProblem.stat.frontend_question_id,
          title: foundProblem.stat.question__title,
          titleSlug: foundProblem.stat.question__title_slug,
          difficulty: foundProblem.difficulty.level,
          timeSpent: formData.timeSpent ? parseInt(formData.timeSpent) : null,
          personalDifficulty: parseInt(formData.personalDifficulty),
          notes: formData.notes || null,
          solution: formData.solution || null,
          language: formData.language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save submission');
      }

      toast.success('Saved. Problem marked as solved.');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to save submission. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyLabel = (level: number) => {
    const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    return labels[level as keyof typeof labels] || 'Unknown';
  };

  const difficultyColor = (level: number) => {
    const colors = {
      1: 'border-emerald-300/80 bg-emerald-50 text-emerald-700',
      2: 'border-amber-300/80 bg-amber-50 text-amber-700',
      3: 'border-rose-300/80 bg-rose-50 text-rose-700',
    };
    return colors[level as keyof typeof colors] || 'border-border';
  };

  const suggestionReason = (difficulty: number) => {
    if (solvedProblemIds.length === 0) {
      return 'Strong starter pattern for building consistency.';
    }

    if (difficulty === recommendedDifficulty) {
      return `Balances your ${difficultyLabel(difficulty)} problem coverage.`;
    }

    return 'High-frequency interview pattern worth revisiting often.';
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">Find LeetCode Problem</CardTitle>
        <CardDescription>
          Search by exact number or title, then capture your solve notes and review context.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border border-border/75 bg-background/70 p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Try: 1 or Two Sum"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              disabled={isSearching}
            />
            <Button onClick={handleSearchClick} disabled={isSearching} className="sm:min-w-28">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        <section className="rounded-2xl border border-border/75 bg-background/65 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-[#ffa116]" />
                Suggested Problems
              </p>
              <p className="text-xs text-muted-foreground">
                Curated picks prioritized by what you&apos;ve solved least.
              </p>
            </div>
          </div>

          {isLoadingSuggestions ? (
            <p className="text-sm text-muted-foreground">Loading suggestions...</p>
          ) : personalizedSuggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You&apos;ve solved all curated suggestions. Search by title or number for new problems.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {personalizedSuggestions.map((problem) => (
                <div
                  key={problem.id}
                  className="rounded-xl border border-border/70 bg-background/75 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {problem.id}. {problem.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{problem.topic}</p>
                    </div>
                    <Badge className={difficultyColor(problem.difficulty)}>
                      {difficultyLabel(problem.difficulty)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{suggestionReason(problem.difficulty)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleSuggestedProblemClick(problem.id)}
                    disabled={isSearching}
                  >
                    Use #{problem.id}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {foundProblem && (
          <div className="rounded-2xl border border-[#ffa1166b] bg-[#fff2de] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#5f3600]">Matched Problem</p>
                <h3 className="mt-1 text-base font-semibold text-[#2d1e00]">
                  {foundProblem.stat.frontend_question_id}. {foundProblem.stat.question__title}
                </h3>
              </div>
              <Badge className={difficultyColor(foundProblem.difficulty.level)}>
                {difficultyLabel(foundProblem.difficulty.level)}
              </Badge>
            </div>
          </div>
        )}

        {showForm && foundProblem && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="personalDifficulty">Personal Difficulty</Label>
                <Select
                  value={formData.personalDifficulty}
                  onValueChange={(value) => setFormData({ ...formData, personalDifficulty: value })}
                >
                  <SelectTrigger id="personalDifficulty" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Easy</SelectItem>
                    <SelectItem value="2">2 - Easy</SelectItem>
                    <SelectItem value="3">3 - Medium</SelectItem>
                    <SelectItem value="4">4 - Hard</SelectItem>
                    <SelectItem value="5">5 - Very Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                <Input
                  id="timeSpent"
                  type="number"
                  placeholder="30"
                  value={formData.timeSpent}
                  onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                  min="0"
                  step="5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Patterns, mistakes, and key idea..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution Code (optional)</Label>
              <Textarea
                id="solution"
                placeholder="Paste your final solution..."
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Solved Problem'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { leetcodeService, type LeetCodeProblem } from '@/lib/services/leetcode';
import { Loader2, Search } from 'lucide-react';

export function ProblemSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foundProblem, setFoundProblem] = useState<LeetCodeProblem | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    timeSpent: '',
    personalDifficulty: '3',
    notes: '',
    solution: '',
    language: 'javascript',
  });

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a problem name or number');
      return;
    }

    setIsSearching(true);
    try {
      const problem = await leetcodeService.searchProblem(query);
      
      if (problem) {
        setFoundProblem(problem);
        setShowForm(true);
        toast.success(`Found: ${problem.stat.question__title}`);
      } else {
        toast.error('Problem not found. Try a different search term.');
        setFoundProblem(null);
        setShowForm(false);
      }
    } catch (error) {
      toast.error('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foundProblem) {
      toast.error('Please search for a problem first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

      toast.success('Problem marked as solved! 🎉');
      router.push('/dashboard');
    } catch (error) {
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
      1: 'text-green-600', 
      2: 'text-yellow-600', 
      3: 'text-red-600' 
    };
    return colors[level as keyof typeof colors] || '';
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Add Solved Problem</CardTitle>
        <CardDescription>
          Search for a LeetCode problem by name or number
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Section */}
        <div className="flex gap-2">
          <Input
            placeholder="e.g., 'Two Sum' or '1'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isSearching}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Found Problem Display */}
        {foundProblem && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {foundProblem.stat.frontend_question_id}. {foundProblem.stat.question__title}
                </h3>
                <span className={`text-sm ${difficultyColor(foundProblem.difficulty.level)}`}>
                  {difficultyLabel(foundProblem.difficulty.level)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submission Form */}
        {showForm && foundProblem && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalDifficulty">How difficult was it for you?</Label>
                <Select
                  value={formData.personalDifficulty}
                  onValueChange={(value) => setFormData({ ...formData, personalDifficulty: value })}
                >
                  <SelectTrigger id="personalDifficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Easy 😌</SelectItem>
                    <SelectItem value="2">2 - Easy 🙂</SelectItem>
                    <SelectItem value="3">3 - Medium 🤔</SelectItem>
                    <SelectItem value="4">4 - Hard 😓</SelectItem>
                    <SelectItem value="5">5 - Very Hard 🤯</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                <Input
                  id="timeSpent"
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.timeSpent}
                  onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                  min="0"
                  step="5"  // Makes arrows increment by 5
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Programming Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger id="language">
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
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Key insights, patterns, or things to remember..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution Code (Optional)</Label>
              <Textarea
                id="solution"
                placeholder="Paste your solution code here..."
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Mark as Solved'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { Brain, Calendar, Clock, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { SubmissionWithProblemAndReviews } from '../../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ReviewCardProps {
  submission: SubmissionWithProblemAndReviews;
  onReviewed: () => void;
}

interface ReviewState {
  notes: string;
  startTime: number;
}

const recallRatings = [
  { level: 1, label: 'Forgot', tone: 'border-rose-300 text-rose-700 hover:bg-rose-50' },
  { level: 2, label: 'Hard', tone: 'border-orange-300 text-orange-700 hover:bg-orange-50' },
  { level: 3, label: 'Okay', tone: 'border-amber-300 text-amber-700 hover:bg-amber-50' },
  { level: 4, label: 'Easy', tone: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
  { level: 5, label: 'Perfect', tone: 'border-teal-300 text-teal-700 hover:bg-teal-50' },
];

export function ReviewCard({ submission, onReviewed }: ReviewCardProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewState>({
    notes: '',
    startTime: Date.now(),
  });

  const handleReview = async (difficulty: number) => {
    const timeSpent = Math.max(1, Math.round((Date.now() - reviewData.startTime) / 60000));

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          difficulty,
          timeSpent,
          notes: reviewData.notes || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success(`Saved. Next review in ${data.nextReview.daysUntil} days.`);
      onReviewed();
    } catch {
      toast.error('Failed to save review');
    }
  };

  const getDifficultyColor = (level: number): string => {
    const colors: Record<number, string> = {
      1: 'border-emerald-300/80 bg-emerald-50 text-emerald-700',
      2: 'border-amber-300/80 bg-amber-50 text-amber-700',
      3: 'border-rose-300/80 bg-rose-50 text-rose-700',
    };
    return colors[level] || 'border-border';
  };

  const getDifficultyLabel = (level: number): string => {
    const labels = ['Easy', 'Medium', 'Hard'];
    return labels[level - 1] || 'Unknown';
  };

  const leetcodeUrl = `https://leetcode.com/problems/${submission.problem.titleSlug}/`;

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl">
              {submission.problem.id}. {submission.problem.title}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3">
              <Badge className={getDifficultyColor(submission.problem.difficulty)}>
                {getDifficultyLabel(submission.problem.difficulty)}
              </Badge>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Reviewed {submission.reviewCount}x
              </span>
              {submission.lastReviewedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Last {new Date(submission.lastReviewedAt).toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={leetcodeUrl} target="_blank" rel="noopener noreferrer">
              Open on LeetCode
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {!isReviewing ? (
          <>
            <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Saved Notes
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {submission.notes || 'No notes were saved for this problem.'}
              </p>
            </section>

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => {
                  setIsReviewing(true);
                  setReviewData((prev) => ({ ...prev, startTime: Date.now() }));
                }}
              >
                <Brain className="h-5 w-5" />
                Start Recall Review
              </Button>
            </div>
          </>
        ) : (
          <>
            <section className="rounded-2xl border border-border/70 bg-background/70 p-5 text-center">
              <h3 className="text-xl font-semibold">Solve from memory first</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Attempt the problem without peeking. Then rate how well you recalled the solution.
              </p>
              {!showSolution && (
                <Button
                  variant="outline"
                  onClick={() => setShowSolution(true)}
                  className="mt-4"
                >
                  <Eye className="h-4 w-4" />
                  Show Previous Solution
                </Button>
              )}
            </section>

            {showSolution && (
              <section className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-5">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Previous Solution
                </h4>
                {submission.solution ? (
                  <pre className="overflow-x-auto rounded-xl border border-border/70 bg-white/80 p-4 text-sm">
                    <code>{submission.solution}</code>
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">No saved solution for this submission.</p>
                )}
              </section>
            )}

            <section className="space-y-4 rounded-2xl border border-border/70 bg-background/70 p-5">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  New Notes
                </h4>
                <Textarea
                  placeholder="What did you forget, what worked faster this time, what to watch next review..."
                  value={reviewData.notes}
                  onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">How hard was recall?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {recallRatings.map((rating) => (
                    <Button
                      key={rating.level}
                      variant="outline"
                      onClick={() => handleReview(rating.level)}
                      className={`h-14 border ${rating.tone}`}
                    >
                      <span className="text-sm font-semibold">{rating.level}</span>
                      <span className="text-[11px]">{rating.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}

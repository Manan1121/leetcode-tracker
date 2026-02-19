'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Brain, Trophy } from 'lucide-react';
import { SubmissionWithProblemAndReviews } from '@/types';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReviewsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithProblemAndReviews[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    fetchDueReviews();
  }, []);

  const fetchDueReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewed = () => {
    setCompletedToday((prev) => prev + 1);
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    fetchDueReviews();
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="space-y-3 text-center">
          <Brain className="mx-auto h-10 w-10 animate-pulse text-[#ffa116]" />
          <p className="text-sm text-muted-foreground">Loading your review queue...</p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-[#ffa116]" />
              No Reviews Due
            </CardTitle>
            <CardDescription>You&apos;re caught up. Keep solving to feed your next review cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              Reviews appear after a solved problem enters the spaced repetition timeline.
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/problems">
                <Button>Solve New Problem</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDue = submissions.length + completedToday;
  const remaining = submissions.length - currentIndex;
  const progress = totalDue > 0 ? (completedToday / totalDue) * 100 : 0;
  const currentSubmission = submissions[currentIndex];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Review Session</p>
        <h1 className="text-3xl sm:text-4xl">Strengthen Recall</h1>
        <p className="text-muted-foreground">Stay consistent and move through today&apos;s spaced repetition queue.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">
              {completedToday}/{totalDue}
            </p>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-[#ffa116] transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{remaining}</p>
            <p className="text-xs text-muted-foreground">Current queue</p>
          </CardContent>
        </Card>
        <Card className="bg-black text-white">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-white/70">Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">Finish today&apos;s list</p>
            <p className="text-xs text-white/70">Momentum compounds fast.</p>
          </CardContent>
        </Card>
      </section>

      {currentSubmission && <ReviewCard submission={currentSubmission} onReviewed={handleReviewed} />}

      {submissions.length > 1 && currentIndex < submissions.length - 1 && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => setCurrentIndex((prev) => prev + 1)}>
            Skip this one for now
          </Button>
        </div>
      )}
    </div>
  );
}

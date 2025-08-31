'use client';

import { useEffect, useState } from 'react';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Calendar, TrendingUp, Trophy } from 'lucide-react';
import Link from 'next/link';
import { SubmissionWithProblemAndReviews } from '@/types';

export default function ReviewsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithProblemAndReviews[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDue: 0,
    completedToday: 0,
    streak: 0
  });

  useEffect(() => {
    fetchDueReviews();
  }, []);

  const fetchDueReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        setStats(prev => ({ ...prev, totalDue: data.length }));
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewed = () => {
    setStats(prev => ({ ...prev, completedToday: prev.completedToday + 1 }));
    
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All reviews complete
      fetchDueReviews(); // Refresh the list
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              No Reviews Due!
            </CardTitle>
            <CardDescription>
              You&apos;re all caught up! Great job staying on top of your reviews.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Your next reviews will appear here when they&apos;re due. Keep solving new problems to build your review queue!
            </p>
            <div className="flex gap-4">
              <Link href="/problems">
                <Button>Solve New Problem</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">View Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSubmission = submissions[currentIndex];
  const progress = ((currentIndex + stats.completedToday) / (submissions.length + stats.completedToday)) * 100;

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Progress Header */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}/{stats.totalDue}</div>
            <div className="w-full bg-secondary h-2 rounded-full mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Review Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {stats.streak} days
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length - currentIndex}</div>
            <p className="text-xs text-muted-foreground">problems to review</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Review Card */}
      {currentSubmission && (
        <ReviewCard 
          submission={currentSubmission} 
          onReviewed={handleReviewed}
        />
      )}

      {/* Skip Button */}
      {submissions.length > 1 && currentIndex < submissions.length - 1 && (
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Skip for now →
          </Button>
        </div>
      )}
    </div>
  );
}
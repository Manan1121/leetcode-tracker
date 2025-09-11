"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Brain,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface Submission {
  id: string;
  solvedAt: string;
  timeSpent: number | null;
  personalDifficulty: number | null;
  notes: string | null;
  nextReviewDate: string | null;
  reviewCount: number;
  problem: {
    id: number;
    title: string;
    difficulty: number;
  };
}

export function DashboardStats() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dueReviews, setDueReviews] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user's submissions
      const submissionsResponse = await fetch("/api/submissions");
      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData);

      // Fetch due reviews
      const reviewsResponse = await fetch("/api/reviews");
      const reviewsData = await reviewsResponse.json();
      setDueReviews(reviewsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSolved = submissions.length;
  const totalTime = submissions.reduce(
    (acc, sub) => acc + (sub.timeSpent || 0),
    0
  );
  const avgDifficulty =
    submissions.length > 0
      ? (
          submissions.reduce(
            (acc, sub) => acc + (sub.personalDifficulty || 3),
            0
          ) / submissions.length
        ).toFixed(1)
      : "0";

  const difficultyBreakdown = {
    easy: submissions.filter((s) => s.problem.difficulty === 1).length,
    medium: submissions.filter((s) => s.problem.difficulty === 2).length,
    hard: submissions.filter((s) => s.problem.difficulty === 3).length,
  };

  const getDifficultyColor = (level: number) => {
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-yellow-100 text-yellow-800",
      3: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100";
  };

  const getDifficultyLabel = (level: number) => {
    const labels = { 1: "Easy", 2: "Medium", 3: "Hard" };
    return labels[level as keyof typeof labels] || "Unknown";
  };

  const getPersonalDifficultyEmoji = (level: number | null) => {
    if (!level) return "";
    const emojis = { 1: "😌", 2: "🙂", 3: "🤔", 4: "😓", 5: "🤯" };
    return emojis[level as keyof typeof emojis] || "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your stats...</p>
        </div>
      </div>
    );
  }

  function getRelativeTime(nextReviewDate: string): import("react").ReactNode {
    const date = new Date(nextReviewDate);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return (
    <div className="space-y-6">
      {/* Review Alert */}
      {dueReviews.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have{" "}
              <strong>
                {dueReviews.length} problem{dueReviews.length > 1 ? "s" : ""}
              </strong>{" "}
              due for review! Reviewing helps strengthen your memory.
            </span>
            <Link href="/reviews">
              <Button size="sm" className="ml-4">
                <Brain className="mr-2 h-4 w-4" />
                Start Review
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSolved}</div>
            <p className="text-xs text-muted-foreground">
              {difficultyBreakdown.easy}E / {difficultyBreakdown.medium}M /{" "}
              {difficultyBreakdown.hard}H
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {totalSolved > 0 ? Math.round(totalTime / totalSolved) : 0}{" "}
              min/problem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Due</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueReviews.length}</div>
            <p className="text-xs text-muted-foreground">
              Spaced repetition active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                submissions.filter((s) => {
                  const date = new Date(s.solvedAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return date >= weekAgo;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Problems this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Submissions</CardTitle>
          <Link href="/problems">
            <Button size="sm">Add Problem</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No problems solved yet.</p>
              <Link href="/problems">
                <Button className="mt-4">Add Your First Problem</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.slice(0, 10).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getDifficultyColor(
                        submission.problem.difficulty
                      )}
                    >
                      {getDifficultyLabel(submission.problem.difficulty)}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {submission.problem.id}. {submission.problem.title}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(submission.solvedAt)}</span>
                        {submission.timeSpent && (
                          <span>{submission.timeSpent} min</span>
                        )}
                        {submission.personalDifficulty && (
                          <span>
                            Difficulty: {submission.personalDifficulty}/5{" "}
                            {getPersonalDifficultyEmoji(
                              submission.personalDifficulty
                            )}
                          </span>
                        )}
                        {submission.reviewCount > 0 && (
                          <span className="text-green-600">
                            ✓ Reviewed {submission.reviewCount}x
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Upcoming Reviews Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Reviews</CardTitle>
          <Link href="/schedule">
            <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Full Schedule
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {submissions
              .filter(
                (s) =>
                  s.nextReviewDate && new Date(s.nextReviewDate) > new Date()
              )
              .sort(
                (a, b) =>
                  new Date(a.nextReviewDate!).getTime() -
                  new Date(b.nextReviewDate!).getTime()
              )
              .slice(0, 5)
              .map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getDifficultyColor(
                        submission.problem.difficulty
                      )}
                    >
                      {getDifficultyLabel(submission.problem.difficulty)}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">
                        {submission.problem.id}. {submission.problem.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Review #{submission.reviewCount + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {submission.nextReviewDate &&
                        getRelativeTime(submission.nextReviewDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.nextReviewDate &&
                        format(new Date(submission.nextReviewDate), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}

            {submissions.filter(
              (s) => s.nextReviewDate && new Date(s.nextReviewDate) > new Date()
            ).length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm space-y-2">
                <p>No upcoming reviews scheduled</p>
                <p className="text-xs">
                  💡 Problems appear here after you review them once. Start with problems due for review to build your schedule!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

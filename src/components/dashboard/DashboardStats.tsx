"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Brain, CalendarDays, Clock, Search, Trash2, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
  const [deletingSubmissionId, setDeletingSubmissionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [submissionsResponse, reviewsResponse] = await Promise.all([
        fetch("/api/submissions"),
        fetch("/api/reviews"),
      ]);
      const submissionsData = await submissionsResponse.json();
      const reviewsData = await reviewsResponse.json();
      setSubmissions(submissionsData);
      setDueReviews(reviewsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSolved = submissions.length;
  const totalTime = submissions.reduce((acc, sub) => acc + (sub.timeSpent || 0), 0);
  const solvedThisWeek = submissions.filter((submission) => {
    const date = new Date(submission.solvedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }).length;

  const difficultyBreakdown = {
    easy: submissions.filter((s) => s.problem.difficulty === 1).length,
    medium: submissions.filter((s) => s.problem.difficulty === 2).length,
    hard: submissions.filter((s) => s.problem.difficulty === 3).length,
  };

  const getDifficultyLabel = (level: number) => {
    const labels = { 1: "Easy", 2: "Medium", 3: "Hard" };
    return labels[level as keyof typeof labels] || "Unknown";
  };

  const getDifficultyTone = (level: number) => {
    const tones = {
      1: "border-emerald-300/80 bg-emerald-50 text-emerald-700",
      2: "border-amber-300/80 bg-amber-50 text-amber-700",
      3: "border-rose-300/80 bg-rose-50 text-rose-700",
    };
    return tones[level as keyof typeof tones] || "border-border";
  };

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getRelativeReviewTime = (nextReviewDate: string) => {
    const date = new Date(nextReviewDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const handleDeleteSubmission = async (submission: Submission) => {
    const shouldDelete = window.confirm(
      `Remove "${submission.problem.title}" from your solved list?\n\nThis also removes its review history.`
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingSubmissionId(submission.id);

    try {
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setSubmissions((current) => current.filter((item) => item.id !== submission.id));
      setDueReviews((current) => current.filter((item) => item.id !== submission.id));
      toast.success("Problem removed from your list");
    } catch {
      toast.error("Could not remove problem");
    } finally {
      setDeletingSubmissionId(null);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesDifficulty =
        difficultyFilter === "all" ||
        (difficultyFilter === "easy" && submission.problem.difficulty === 1) ||
        (difficultyFilter === "medium" && submission.problem.difficulty === 2) ||
        (difficultyFilter === "hard" && submission.problem.difficulty === 3);

      const matchesSearch =
        searchQuery.trim().length === 0 ||
        submission.problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.problem.id.toString().includes(searchQuery.trim());

      return matchesDifficulty && matchesSearch;
    });
  }, [submissions, difficultyFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your stats...</p>
        </div>
      </div>
    );
  }

  const upcomingReviews = submissions
    .filter((submission) => submission.nextReviewDate && new Date(submission.nextReviewDate) > new Date())
    .sort(
      (a, b) => new Date(a.nextReviewDate as string).getTime() - new Date(b.nextReviewDate as string).getTime()
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {dueReviews.length > 0 && (
        <Alert className="border-[#ffa11666] bg-[#fff4e5]">
          <AlertCircle className="h-4 w-4 text-[#a15c00]" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-[#5f3600]">
              <strong>{dueReviews.length}</strong> review{dueReviews.length > 1 ? "s are" : " is"} due.
              Keep retention high by clearing the queue.
            </span>
            <Link href="/reviews">
              <Button size="sm">
                <Brain className="h-4 w-4" />
                Start Reviews
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Total Solved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">{totalSolved}</p>
            <p className="text-xs text-muted-foreground">
              {difficultyBreakdown.easy}E / {difficultyBreakdown.medium}M / {difficultyBreakdown.hard}H
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Time Invested</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </p>
            <p className="text-xs text-muted-foreground">
              {totalSolved > 0 ? Math.round(totalTime / totalSolved) : 0} min average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Reviews Due</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">{dueReviews.length}</p>
            <p className="text-xs text-muted-foreground">Spaced repetition queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Solved This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">{solvedThisWeek}</p>
            <p className="text-xs text-muted-foreground">Past 7 days</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Submissions</CardTitle>
            <Link href="/problems">
              <Button size="sm">Add Problem</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-background/70 px-6 py-10 text-center">
                <p className="text-muted-foreground">No solved problems yet.</p>
                <Link href="/problems" className="mt-4 inline-flex">
                  <Button className="mt-4">Add Your First Problem</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 rounded-xl border border-border/70 bg-background/70 p-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["all", "easy", "medium", "hard"] as const).map((filter) => (
                      <Button
                        key={filter}
                        size="sm"
                        variant={difficultyFilter === filter ? "default" : "outline"}
                        onClick={() => setDifficultyFilter(filter)}
                        className="capitalize"
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </div>

                {filteredSubmissions.slice(0, 10).map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-xl border border-border/70 bg-background/75 px-4 py-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {submission.problem.id}. {submission.problem.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDateLabel(submission.solvedAt)}</span>
                          {submission.timeSpent && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {submission.timeSpent} min
                            </span>
                          )}
                          {submission.reviewCount > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Reviewed {submission.reviewCount}x
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={getDifficultyTone(submission.problem.difficulty)}>
                        {getDifficultyLabel(submission.problem.difficulty)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => handleDeleteSubmission(submission)}
                        disabled={deletingSubmissionId === submission.id}
                        aria-label={`Delete ${submission.problem.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredSubmissions.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/80 bg-background/70 px-6 py-8 text-center text-sm text-muted-foreground">
                    No submissions match this filter.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Reviews</CardTitle>
            <Link href="/schedule">
              <Button size="sm" variant="outline">
                <CalendarDays className="h-4 w-4" />
                Full Schedule
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingReviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-background/70 px-5 py-8 text-center text-sm text-muted-foreground">
                Upcoming reviews appear after your first completed review cycle.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReviews.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-xl border border-border/70 bg-background/75 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {submission.problem.id}. {submission.problem.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Review #{submission.reviewCount + 1}
                        </p>
                      </div>
                      {submission.nextReviewDate && (
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {getRelativeReviewTime(submission.nextReviewDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.nextReviewDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

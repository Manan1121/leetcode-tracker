'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, eachDayOfInterval, format, isSameDay, startOfDay } from 'date-fns';
import { AlertTriangle, ArrowRight, Calendar, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ScheduledSubmission {
  id: string;
  nextReviewDate: string;
  reviewCount: number;
  interval: number;
  problem: {
    id: number;
    title: string;
    difficulty: number;
  };
}

type ListFilter = 'focus' | '30days' | 'all';

interface EnrichedSubmission extends ScheduledSubmission {
  parsedDate: Date;
  dayOffset: number;
}

export default function SchedulePage() {
  const [submissions, setSubmissions] = useState<ScheduledSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [listFilter, setListFilter] = useState<ListFilter>('focus');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/submissions/scheduled');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = useMemo(() => startOfDay(new Date()), []);

  const enriched = useMemo<EnrichedSubmission[]>(() => {
    return submissions
      .map((submission) => {
        const parsedDate = new Date(submission.nextReviewDate);
        const dayOffset = differenceInCalendarDays(parsedDate, today);
        return { ...submission, parsedDate, dayOffset };
      })
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
  }, [submissions, today]);

  const overdueSubmissions = useMemo(
    () => enriched.filter((submission) => submission.dayOffset < 0),
    [enriched]
  );
  const dueTodaySubmissions = useMemo(
    () => enriched.filter((submission) => submission.dayOffset === 0),
    [enriched]
  );
  const dueNextWeekSubmissions = useMemo(
    () => enriched.filter((submission) => submission.dayOffset > 0 && submission.dayOffset <= 7),
    [enriched]
  );
  const plannedLaterSubmissions = useMemo(
    () => enriched.filter((submission) => submission.dayOffset > 7),
    [enriched]
  );

  const priorityQueue = useMemo(
    () => [...overdueSubmissions, ...dueTodaySubmissions, ...dueNextWeekSubmissions],
    [dueNextWeekSubmissions, dueTodaySubmissions, overdueSubmissions]
  );

  const next14Days = useMemo(
    () =>
      eachDayOfInterval({
        start: today,
        end: addDays(today, 13),
      }),
    [today]
  );

  const loadByDay = useMemo(() => {
    return next14Days.map((day) => ({
      day,
      count: enriched.filter((submission) => isSameDay(submission.parsedDate, day)).length,
    }));
  }, [enriched, next14Days]);

  const maxLoad = useMemo(
    () => Math.max(...loadByDay.map((day) => day.count), 1),
    [loadByDay]
  );

  const highestLoadDay = useMemo(() => {
    return loadByDay.reduce(
      (highest, current) => (current.count > highest.count ? current : highest),
      loadByDay[0] || { day: today, count: 0 }
    );
  }, [loadByDay, today]);

  const filteredForList = useMemo(() => {
    if (listFilter === 'focus') {
      return priorityQueue;
    }
    if (listFilter === '30days') {
      return enriched.filter((submission) => submission.dayOffset <= 30);
    }
    return enriched;
  }, [enriched, listFilter, priorityQueue]);

  const groupedForList = useMemo(() => {
    return filteredForList.reduce((acc, submission) => {
      const dateKey = format(submission.parsedDate, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(submission);
      return acc;
    }, {} as Record<string, EnrichedSubmission[]>);
  }, [filteredForList]);

  const getDifficultyLabel = (level: number) => {
    const labels = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    return labels[level as keyof typeof labels] || 'Unknown';
  };

  const getDifficultyTone = (level: number) => {
    const tones = {
      1: 'border-emerald-300/80 bg-emerald-50 text-emerald-700',
      2: 'border-amber-300/80 bg-amber-50 text-amber-700',
      3: 'border-rose-300/80 bg-rose-50 text-rose-700',
    };
    return tones[level as keyof typeof tones] || 'border-border';
  };

  const getRelativeTime = (dayOffset: number) => {
    if (dayOffset < 0) return `Overdue by ${Math.abs(dayOffset)} day${Math.abs(dayOffset) === 1 ? '' : 's'}`;
    if (dayOffset === 0) return 'Today';
    if (dayOffset === 1) return 'Tomorrow';
    if (dayOffset <= 7) return `In ${dayOffset} days`;
    if (dayOffset <= 30) return `In ${Math.ceil(dayOffset / 7)} weeks`;
    return `In ${Math.ceil(dayOffset / 30)} months`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="space-y-3 text-center">
          <Calendar className="mx-auto h-10 w-10 animate-pulse text-[#00b8a3]" />
          <p className="text-sm text-muted-foreground">Loading review plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Planning</p>
        <h1 className="text-3xl sm:text-4xl">Review Schedule</h1>
        <p className="max-w-3xl text-muted-foreground">
          This page is your planning board: clear the priority queue first, then use the timeline to avoid future
          pileups.
        </p>
      </header>

      <Card className="border-[#ffa1165e] bg-[#fff6e8]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#5a3300]">Today&apos;s objective</p>
            <p className="text-sm text-[#714200]">
              Handle <strong>{overdueSubmissions.length + dueTodaySubmissions.length}</strong> urgent review
              {overdueSubmissions.length + dueTodaySubmissions.length === 1 ? '' : 's'} first.
            </p>
            {overdueSubmissions.length > 0 && (
              <p className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {overdueSubmissions.length} overdue need attention.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/reviews">
              <Button>
                Start Reviews
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/problems">
              <Button variant="outline">Add Solved Problem</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className={overdueSubmissions.length > 0 ? 'border-rose-300/80' : ''}>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-semibold ${overdueSubmissions.length > 0 ? 'text-rose-600' : ''}`}>
              {overdueSubmissions.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{dueTodaySubmissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Due Next 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{dueNextWeekSubmissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Planned Later</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{plannedLaterSubmissions.length}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Priority Queue</CardTitle>
              <CardDescription>Overdue, today, and next 7 days in execution order.</CardDescription>
            </div>
            <Badge variant="outline">{priorityQueue.length} queued</Badge>
          </CardHeader>
          <CardContent>
            {priorityQueue.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-background/70 px-4 py-8 text-center text-sm text-muted-foreground">
                No immediate reviews. You&apos;re in a good spot.
              </div>
            ) : (
              <div className="space-y-2">
                {priorityQueue.slice(0, 8).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/70 px-4 py-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        {submission.problem.id}. {submission.problem.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(submission.dayOffset)} • Review #{submission.reviewCount + 1}
                      </p>
                    </div>
                    <Badge className={getDifficultyTone(submission.problem.difficulty)}>
                      {getDifficultyLabel(submission.problem.difficulty)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>14-Day Load</CardTitle>
            <CardDescription>Use this to spot future spikes before they become overdue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-1.5">
              {loadByDay.map((entry) => (
                <div key={entry.day.toISOString()} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-black/80"
                    style={{
                      height: `${Math.max((entry.count / maxLoad) * 68, entry.count > 0 ? 8 : 2)}px`,
                      opacity: entry.count > 0 ? 1 : 0.22,
                    }}
                    title={`${format(entry.day, 'EEE, MMM d')}: ${entry.count} review${entry.count === 1 ? '' : 's'}`}
                  />
                  <p className="text-[10px] text-muted-foreground">{format(entry.day, 'd')}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              Highest load: <strong>{format(highestLoadDay.day, 'EEE, MMM d')}</strong> (
              {highestLoadDay.count} review{highestLoadDay.count === 1 ? '' : 's'})
            </div>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="list">Planner List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListChecks className="h-4 w-4" />
                Scheduled Items
              </CardTitle>
              <CardDescription>Switch between focus, next 30 days, or full backlog.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={listFilter === 'focus' ? 'default' : 'outline'}
                  onClick={() => setListFilter('focus')}
                >
                  Focus
                </Button>
                <Button
                  size="sm"
                  variant={listFilter === '30days' ? 'default' : 'outline'}
                  onClick={() => setListFilter('30days')}
                >
                  Next 30 Days
                </Button>
                <Button
                  size="sm"
                  variant={listFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setListFilter('all')}
                >
                  All
                </Button>
              </div>

              {Object.keys(groupedForList).length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/80 bg-background/70 px-4 py-8 text-center text-sm text-muted-foreground">
                  No reviews in this range.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedForList)
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .map(([date, items]) => (
                      <div key={date} className="rounded-xl border border-border/70 bg-background/70 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold">{format(new Date(date), 'EEEE, MMM d')}</p>
                          <Badge variant="secondary">
                            {items.length} item{items.length === 1 ? '' : 's'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {items.map((submission) => (
                            <div
                              key={submission.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {submission.problem.id}. {submission.problem.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getRelativeTime(submission.dayOffset)} • Next interval {submission.interval} day
                                  {submission.interval === 1 ? '' : 's'}
                                </p>
                              </div>
                              <Badge className={getDifficultyTone(submission.problem.difficulty)}>
                                {getDifficultyLabel(submission.problem.difficulty)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Next 30 Days</CardTitle>
              <CardDescription>Calendar view of your review volume.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <p
                    key={day}
                    className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {day}
                  </p>
                ))}

                {eachDayOfInterval({ start: today, end: addDays(today, 30) }).map((day, index) => {
                  const dayItems = enriched.filter((submission) => isSameDay(submission.parsedDate, day));
                  const isToday = isSameDay(day, today);

                  return (
                    <div
                      key={index}
                      className={`min-h-[96px] rounded-xl border p-2.5 ${
                        isToday ? 'border-[#ffa11699] bg-[#fff4e5]' : 'border-border/70 bg-background/65'
                      }`}
                    >
                      <p className="text-sm font-semibold">{format(day, 'd')}</p>
                      {dayItems.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <Badge variant="outline">
                            {dayItems.length} review{dayItems.length === 1 ? '' : 's'}
                          </Badge>
                          {dayItems.slice(0, 2).map((item) => (
                            <p key={item.id} className="truncate text-[11px] text-muted-foreground">
                              {item.problem.title}
                            </p>
                          ))}
                          {dayItems.length > 2 && (
                            <p className="text-[11px] text-muted-foreground">+{dayItems.length - 2} more</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

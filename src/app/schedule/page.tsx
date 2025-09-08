'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Brain, TrendingUp, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

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

export default function SchedulePage() {
  const [submissions, setSubmissions] = useState<ScheduledSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');

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

  const getDifficultyColor = (level: number) => {
    const colors = { 
      1: 'bg-green-100 text-green-800', 
      2: 'bg-yellow-100 text-yellow-800', 
      3: 'bg-red-100 text-red-800' 
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100';
  };

  const getDifficultyLabel = (level: number) => {
    const labels = ['Easy', 'Medium', 'Hard'];
    return labels[level - 1] || 'Unknown';
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  };

  const getReviewColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 bg-red-50';
    if (diffDays === 0) return 'text-orange-600 bg-orange-50';
    if (diffDays === 1) return 'text-yellow-600 bg-yellow-50';
    if (diffDays <= 3) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  // Group submissions by date
  const groupedByDate = submissions.reduce((acc, submission) => {
    const date = format(new Date(submission.nextReviewDate), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(submission);
    return acc;
  }, {} as Record<string, ScheduledSubmission[]>);

  // Get next 30 days for calendar view
  const next30Days = eachDayOfInterval({
    start: new Date(),
    end: addDays(new Date(), 30)
  });

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Calendar className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Schedule</h1>
          <p className="text-muted-foreground">
            You have {submissions.length} problems scheduled for review
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => {
                const date = new Date(s.nextReviewDate);
                return isSameDay(date, new Date());
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => {
                const date = new Date(s.nextReviewDate);
                const weekEnd = endOfWeek(new Date());
                return date <= weekEnd;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => {
                const date = new Date(s.nextReviewDate);
                const monthEnd = endOfMonth(new Date());
                return date <= monthEnd;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {submissions.filter(s => {
                const date = new Date(s.nextReviewDate);
                return date < new Date() && !isSameDay(date, new Date());
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Grouped List View */}
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .slice(0, 30) // Show next 30 days
            .map(([date, problems]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{format(new Date(date), 'EEEE, MMMM d')}</span>
                    <Badge variant="secondary">
                      {problems.length} problem{problems.length > 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {getRelativeTime(date)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {problems.map((submission) => (
                      <div 
                        key={submission.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getDifficultyColor(submission.problem.difficulty)}>
                            {getDifficultyLabel(submission.problem.difficulty)}
                          </Badge>
                          <div>
                            <p className="font-medium">
                              {submission.problem.id}. {submission.problem.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Review #{submission.reviewCount + 1} • 
                              Next interval: {submission.interval} days
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendar Grid View */}
          <Card>
            <CardHeader>
              <CardTitle>Next 30 Days</CardTitle>
              <CardDescription>
                Visual overview of your upcoming reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {next30Days.map((day, index) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayProblems = groupedByDate[dateStr] || [];
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-2 border rounded-lg
                        ${isToday ? 'border-primary bg-primary/5' : 'border-border'}
                        ${dayProblems.length > 0 ? 'cursor-pointer hover:bg-accent/50' : ''}
                      `}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      {dayProblems.length > 0 && (
                        <div className="space-y-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getReviewColor(dateStr)}`}
                          >
                            {dayProblems.length} review{dayProblems.length > 1 ? 's' : ''}
                          </Badge>
                          {dayProblems.slice(0, 2).map((prob, i) => (
                            <div key={i} className="text-xs text-muted-foreground truncate">
                              {prob.problem.title}
                            </div>
                          ))}
                          {dayProblems.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayProblems.length - 2} more
                            </div>
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
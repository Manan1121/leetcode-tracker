'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Brain, Clock, Calendar } from 'lucide-react';
import { SubmissionWithProblemAndReviews } from '../../types';

interface ReviewCardProps {
  submission: SubmissionWithProblemAndReviews;
  onReviewed: () => void;
}

interface ReviewState {
  difficulty: number;
  notes: string;
  startTime: number;
}

export function ReviewCard({ submission, onReviewed }: ReviewCardProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewState>({
    difficulty: 0,
    notes: '',
    startTime: Date.now()
  });

  const handleReview = async (difficulty: number) => {
    const timeSpent = Math.round((Date.now() - reviewData.startTime) / 60000); // Convert to minutes
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          difficulty,
          timeSpent,
          notes: reviewData.notes || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Review complete! Next review in ${data.nextReview.daysUntil} days`);
        onReviewed();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to save review');
    }
  };

  const getDifficultyColor = (level: number): string => {
    const colors: Record<number, string> = { 
      1: 'bg-green-100 text-green-800', 
      2: 'bg-yellow-100 text-yellow-800', 
      3: 'bg-red-100 text-red-800' 
    };
    return colors[level] || 'bg-gray-100';
  };

  const getDifficultyLabel = (level: number): string => {
    const labels = ['Easy', 'Medium', 'Hard'];
    return labels[level - 1] || 'Unknown';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {submission.problem.id}. {submission.problem.title}
            </CardTitle>
            <CardDescription className="mt-2">
              <Badge className={getDifficultyColor(submission.problem.difficulty)}>
                {getDifficultyLabel(submission.problem.difficulty)}
              </Badge>
              <span className="ml-4">
                <Clock className="inline h-4 w-4 mr-1" />
                Reviewed {submission.reviewCount} times
              </span>
              {submission.lastReviewedAt && (
                <span className="ml-4">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Last: {new Date(submission.lastReviewedAt).toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isReviewing ? (
          <>
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="font-semibold mb-2">📝 Your Notes:</h3>
              <p className="whitespace-pre-wrap">{submission.notes || 'No notes saved'}</p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={() => {
                  setIsReviewing(true);
                  setReviewData({ ...reviewData, startTime: Date.now() });
                }}
              >
                <Brain className="mr-2 h-5 w-5" />
                Start Review
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">
                Try to solve this problem without looking at your solution!
              </h3>
              <p className="text-muted-foreground mb-6">
                Once you&apos;ve attempted it, rate how difficult it was to recall the solution.
              </p>
              
              {!showSolution && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowSolution(true)}
                  className="mb-6"
                >
                  Show My Previous Solution
                </Button>
              )}
            </div>
            
            {showSolution && submission.solution && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Your Solution:</h4>
                <pre className="text-sm overflow-x-auto">
                  <code>{submission.solution}</code>
                </pre>
              </div>
            )}
            
            <div className="space-y-4">
              <Textarea
                placeholder="Additional notes from this review..."
                value={reviewData.notes}
                onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                rows={3}
              />
              
              <div className="space-y-2">
                <p className="font-semibold">How difficult was it to recall the solution?</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const labels = ['Forgot', 'Hard', 'Medium', 'Easy', 'Perfect'];
                    const colors = [
                      'hover:bg-red-100',
                      'hover:bg-orange-100',
                      'hover:bg-yellow-100',
                      'hover:bg-green-100',
                      'hover:bg-green-200'
                    ];
                    
                    return (
                      <Button
                        key={level}
                        variant="outline"
                        onClick={() => handleReview(level)}
                        className={colors[level - 1]}
                      >
                        {level}<br/>
                        <span className="text-xs">{labels[level - 1]}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
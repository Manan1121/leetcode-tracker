import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Brain, Clock, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          LeetCode Tracker
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
          Track your LeetCode journey, add personal notes, and master algorithms with spaced repetition.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/problems">
            <Button size="lg">Add Your First Problem</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">View Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Track Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Log every problem you solve with personal difficulty ratings and time spent.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Brain className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Personal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Add notes and solution code to remember key patterns and insights.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Spaced Repetition</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Review problems at optimal intervals to strengthen your understanding.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle>Track Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Visualize your progress with detailed statistics and insights.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
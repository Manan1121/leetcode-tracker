import Link from "next/link";
import { ArrowRight, Brain, ChartColumnBig, Clock3, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Capture Every Solve",
    description: "Store time spent, your own difficulty rating, and notes right after each submission.",
    icon: NotebookPen,
  },
  {
    title: "Review at the Right Time",
    description: "Use spaced repetition to surface questions before you forget patterns.",
    icon: Brain,
  },
  {
    title: "Stay Honest with Data",
    description: "Track solve volume, pace, and review load in one place.",
    icon: ChartColumnBig,
  },
];

export default function Home() {
  return (
    <div className="space-y-12 pb-8">
      <section className="glass-panel relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#ffa1161f] blur-2xl" />
        <div className="absolute -bottom-20 left-24 h-44 w-44 rounded-full bg-[#00b8a31c] blur-3xl" />

        <div className="relative max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Structured LeetCode Practice
          </p>
          <h1 className="text-4xl leading-tight sm:text-5xl">
            A focused tracker for problems, reviews, and momentum.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Keep your workflow simple: log what you solved, revisit what matters, and build retention
            with an interface that stays out of your way.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/problems">
              <Button size="lg">
                Add Solved Problem
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-black text-white">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">Focus</p>
              <p className="mt-2 text-2xl font-semibold">Problem First</p>
            </div>
            <Clock3 className="h-7 w-7 text-[#ffa116]" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tone</p>
            <p className="mt-2 text-2xl font-semibold">Clean UI</p>
            <p className="mt-1 text-sm text-muted-foreground">Minimal chrome, strong hierarchy.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Method</p>
            <p className="mt-2 text-2xl font-semibold">Spaced Recall</p>
            <p className="mt-1 text-sm text-muted-foreground">Practice timing modeled for memory.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="h-full">
            <CardHeader>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-white">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}

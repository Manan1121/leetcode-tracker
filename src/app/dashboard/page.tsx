import { DashboardStats } from '@/components/dashboard/DashboardStats';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Overview
        </p>
        <h1 className="text-4xl leading-tight sm:text-5xl">Your Dashboard</h1>
        <p className="max-w-2xl text-muted-foreground">
          Track solved problems, review load, and upcoming spaced repetition sessions.
        </p>
      </header>
      <DashboardStats />
    </div>
  );
}

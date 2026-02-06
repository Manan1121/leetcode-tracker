import { ProblemSearch } from '@/components/problems/ProblemSearch';

export default function ProblemsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Intake
        </p>
        <h1 className="text-3xl sm:text-4xl">Log a Solved Problem</h1>
        <p className="text-muted-foreground">
          Search by title or number, then save the context you want to remember.
        </p>
      </header>
      <ProblemSearch />
    </div>
  );
}

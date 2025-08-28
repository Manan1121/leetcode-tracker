import Link from "next/link";

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              LeetCode Tracker
            </Link>
            <div className="hidden md:flex space-x-4">
              <a href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </a>
              <a href="/problems" className="text-sm font-medium hover:text-primary">
                Add Problem
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
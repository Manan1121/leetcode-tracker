import { DashboardStats } from '@/components/dashboard/DashboardStats';

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      <DashboardStats />
    </div>
  );
}
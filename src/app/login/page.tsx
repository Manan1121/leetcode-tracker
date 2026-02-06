'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
        return;
      }

      toast.success('Welcome back');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-md sm:mt-12">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Account</p>
        <h1 className="text-3xl">Sign In</h1>
        <p className="text-sm text-muted-foreground">Continue your problem tracking workflow.</p>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Use Google or email to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <GoogleButton text="Continue with Google" disabled={isLoading} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.12em]">
              <span className="bg-card px-3 text-muted-foreground">or email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In with Email'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/register" className="font-semibold text-foreground hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

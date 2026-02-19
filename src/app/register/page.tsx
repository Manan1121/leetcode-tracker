"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  const validatePassword = (password: string) => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    });
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    validatePassword(password);
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Please satisfy all password rules");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      toast.success("Account created");
      const result = await signIn("credentials", {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordCheck = ({ passed, text }: { passed: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-xs ${passed ? "text-emerald-700" : "text-muted-foreground"}`}>
      {passed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="mx-auto mt-8 w-full max-w-md sm:mt-12">
      <div className="mb-6 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Account</p>
        <h1 className="text-3xl">Create Account</h1>
        <p className="text-sm text-muted-foreground">Set up your profile and start tracking deliberate practice.</p>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Join LeetCode Tracker</CardTitle>
          <CardDescription>Sign up with Google or email credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <GoogleButton text="Sign up with Google" disabled={isLoading} />

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
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

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
                placeholder="Use a strong password"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                disabled={isLoading}
              />

              {formData.password && (
                <div className="space-y-1 rounded-xl border border-border/80 bg-background/70 p-3">
                  <PasswordCheck passed={passwordChecks.length} text="Minimum 8 characters" />
                  <PasswordCheck passed={passwordChecks.uppercase} text="At least one uppercase letter" />
                  <PasswordCheck passed={passwordChecks.lowercase} text="At least one lowercase letter" />
                  <PasswordCheck passed={passwordChecks.number} text="At least one number" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-rose-600">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isPasswordValid || formData.password !== formData.confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

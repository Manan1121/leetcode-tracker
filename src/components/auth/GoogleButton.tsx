'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FcGoogle } from 'react-icons/fc'; // 1. Import the icon

interface GoogleButtonProps {
  text?: string;
  callbackUrl?: string;
  disabled?: boolean;
}

export function GoogleButton({
  text = "Continue with Google",
  callbackUrl = "/dashboard",
  disabled = false
}: GoogleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      toast.error('Failed to connect with Google');
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting to Google...
        </>
      ) : (
        <>
          {/* 2. Use the imported icon component */}
          <FcGoogle className="mr-2 h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  );
}
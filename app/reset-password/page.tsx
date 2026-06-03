"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLayout } from "@/components/shared/auth-layout";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/lib/errors";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await authService.resetPassword(token, password);
      setMessage(data.message);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      description="Enter your new password"
      backHref="/login"
      backLabel="Back to login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <AlertDescription>
              {message}{" "}
              <Link href="/login" className="font-medium text-primary underline">
                Sign in
              </Link>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="token">Reset token</Label>
          <Input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            minLength={32}
            className="h-10 font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-10"
          />
        </div>
        <Button
          type="submit"
          className="h-10 w-full"
          disabled={loading || !!message}
        >
          {loading ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

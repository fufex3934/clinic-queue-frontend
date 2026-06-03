"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLayout } from "@/components/shared/auth-layout";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/lib/errors";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setDevToken(null);
    try {
      const { data } = await authService.forgotPassword(identifier.trim());
      setMessage(data.message);
      if (data.resetToken) {
        setDevToken(data.resetToken);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Request failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      description="Enter your email or phone to receive reset instructions"
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
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {devToken && (
          <Alert>
            <AlertDescription>
              Dev reset token:{" "}
              <Link
                href={`/reset-password?token=${devToken}`}
                className="font-mono text-primary underline"
              >
                use this link
              </Link>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or phone</Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="h-10"
          />
        </div>
        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
        <Button
          variant="link"
          className="w-full"
          render={<Link href="/login" />}
        >
          Back to login
        </Button>
      </form>
    </AuthLayout>
  );
}

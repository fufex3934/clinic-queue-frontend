"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorAlert } from "@/components/shared/error-alert";
import { ROLE_LABELS } from "@/lib/roles";
import { getErrorMessage } from "@/lib/errors";
import { userService } from "@/services/userService";
import type { StaffUser } from "@/types/user";

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<StaffUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void userService
      .getById(id)
      .then(({ data }) => setUser(data))
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "Failed to load user")),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" render={<Link href="/dashboard/admin" />}>
        <ArrowLeft className="mr-2 size-4" />
        Back to administration
      </Button>

      {error && <ErrorAlert title="Error" message={error} />}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user.name}
              <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {user.email && (
              <p>
                <span className="text-muted-foreground">Email:</span> {user.email}
              </p>
            )}
            {user.phone && (
              <p>
                <span className="text-muted-foreground">Phone:</span> {user.phone}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">Status:</span>{" "}
              {user.isActive ? "Active" : "Disabled"}
            </p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

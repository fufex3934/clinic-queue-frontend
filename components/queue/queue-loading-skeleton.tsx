import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CurrentTokenSkeleton() {
  return (
    <div className="surface-elevated overflow-hidden rounded-xl p-6 md:p-8">
      <Skeleton className="mb-4 h-4 w-32" />
      <Skeleton className="mb-6 h-24 w-40 md:h-28" />
      <div className="flex gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export function QueueListSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3 border-b">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
        <div className="flex gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[5.5rem] w-full rounded-xl" />
        ))}
      </CardContent>
    </Card>
  );
}

/** @deprecated Use QueueListSkeleton */
export const QueueTableSkeleton = QueueListSkeleton;

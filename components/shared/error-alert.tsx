import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorAlert({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
}: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <AlertCircle className="size-4 shrink-0" />
      <div className="flex-1 space-y-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="shrink-0 border-destructive/30 bg-background hover:bg-destructive/10"
        >
          {retryLabel}
        </Button>
      )}
    </Alert>
  );
}

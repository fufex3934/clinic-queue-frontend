import { Badge } from "@/components/ui/badge";
import {
  renewalStatusLabel,
  renewalStatusVariant,
  type RenewalStatus,
} from "@/lib/subscription-renewal";

export function SubscriptionStatusBadge({
  status,
  className,
}: {
  status: RenewalStatus;
  className?: string;
}) {
  return (
    <Badge variant={renewalStatusVariant(status)} className={className}>
      {renewalStatusLabel(status)}
    </Badge>
  );
}

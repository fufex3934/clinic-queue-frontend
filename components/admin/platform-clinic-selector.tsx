"use client";

import { Building2 } from "lucide-react";
import { useClinicContext } from "@/contexts/clinic-context";
import { Label } from "@/components/ui/label";

export function PlatformClinicSelector() {
  const {
    isPlatformView,
    clinics,
    operationalClinicId,
    setOperationalClinicId,
    loadingClinics,
  } = useClinicContext();

  if (!isPlatformView) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
      <Building2 className="size-4 text-primary" />
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Label htmlFor="platform-clinic-select" className="text-sm font-medium">
          View clinic mode
        </Label>
        <select
          id="platform-clinic-select"
          className="h-9 min-w-[200px] rounded-md border border-input bg-background px-2 text-sm"
          value={operationalClinicId ?? ""}
          disabled={loadingClinics}
          onChange={(e) => setOperationalClinicId(e.target.value)}
        >
          {clinics.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
              {c.isActive === false ? " (inactive)" : ""}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          Operational pages use this clinic&apos;s data
        </span>
      </div>
    </div>
  );
}

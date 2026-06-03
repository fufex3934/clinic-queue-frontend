"use client";

import { Building2 } from "lucide-react";
import { useClinicContext } from "@/contexts/clinic-context";
import { Label } from "@/components/ui/label";

/** Unified active clinic context — platform selector or staff clinic label. */
export function ActiveClinicSelector() {
  const {
    isPlatformView,
    clinics,
    operationalClinicId,
    setOperationalClinicId,
    loadingClinics,
    activeClinic,
  } = useClinicContext();

  if (!isPlatformView) {
    if (!activeClinic) return null;
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="size-4 shrink-0" />
        <span>
          <span className="font-medium text-foreground">{activeClinic.name}</span>
          {" · "}
          {activeClinic.location}
        </span>
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
      <Building2 className="size-4 text-primary" />
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Label htmlFor="active-clinic-select" className="text-sm font-medium">
          Active clinic
        </Label>
        <select
          id="active-clinic-select"
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
      </div>
    </div>
  );
}

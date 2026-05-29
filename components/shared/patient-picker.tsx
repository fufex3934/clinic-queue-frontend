"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import type { Patient } from "@/types";

interface PatientPickerProps {
  patients: Patient[];
  value: string;
  onChange: (patientId: string) => void;
  disabled?: boolean;
}

export function PatientPicker({
  patients,
  value,
  onChange,
  disabled,
}: PatientPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [patients, query]);

  return (
    <div className="space-y-2">
      <Label htmlFor="patient-search">Search patient</Label>
      <input
        id="patient-search"
        type="search"
        placeholder="Name or phone…"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={disabled}
      />
      <Label htmlFor="patient-select">Patient</Label>
      <select
        id="patient-select"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || filtered.length === 0}
      >
        <option value="">Select a patient…</option>
        {filtered.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} — {p.phone}
          </option>
        ))}
      </select>
      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No patients match. Create a patient first.
        </p>
      )}
    </div>
  );
}

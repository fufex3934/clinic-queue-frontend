"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/contexts/locale-provider";
import { ETHIOPIA_PHONE_PLACEHOLDER } from "@/lib/phone";
import { PATIENT_GENDER_OPTIONS } from "@/lib/patient";
import type { PatientGender } from "@/types/patient";

export type PatientProfileFormState = {
  dateOfBirth: string;
  gender: PatientGender | "";
  secondaryPhone: string;
  notes: string;
};

export const emptyPatientProfileForm = (): PatientProfileFormState => ({
  dateOfBirth: "",
  gender: "",
  secondaryPhone: "",
  notes: "",
});

export function patientProfileFromPatient(p: {
  dateOfBirth?: string | null;
  gender?: PatientGender | null;
  secondaryPhone?: string | null;
  notes?: string | null;
}): PatientProfileFormState {
  return {
    dateOfBirth: p.dateOfBirth?.slice(0, 10) ?? "",
    gender: p.gender ?? "",
    secondaryPhone: p.secondaryPhone ?? "",
    notes: p.notes ?? "",
  };
}

export function patientProfilePayload(profile: PatientProfileFormState) {
  return {
    dateOfBirth: profile.dateOfBirth.trim() || undefined,
    gender: profile.gender || undefined,
    secondaryPhone: profile.secondaryPhone.trim() || undefined,
    notes: profile.notes.trim() || undefined,
  };
}

type PatientProfileFieldsProps = {
  idPrefix: string;
  profile: PatientProfileFormState;
  onChange: (profile: PatientProfileFormState) => void;
  disabled?: boolean;
};

export function PatientProfileFields({
  idPrefix,
  profile,
  onChange,
  disabled,
}: PatientProfileFieldsProps) {
  const { translate } = useLocale();
  const set = (patch: Partial<PatientProfileFormState>) =>
    onChange({ ...profile, ...patch });

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {translate("optionalProfile")}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-dob`}>{translate("dateOfBirth")}</Label>
          <Input
            id={`${idPrefix}-dob`}
            type="date"
            value={profile.dateOfBirth}
            onChange={(e) => set({ dateOfBirth: e.target.value })}
            disabled={disabled}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-gender`}>{translate("gender")}</Label>
          <select
            id={`${idPrefix}-gender`}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={profile.gender}
            onChange={(e) =>
              set({ gender: e.target.value as PatientGender | "" })
            }
            disabled={disabled}
          >
            <option value="">{translate("genderNotSpecified")}</option>
            {PATIENT_GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-secondary-phone`}>
          {translate("secondaryPhone")}
        </Label>
        <Input
          id={`${idPrefix}-secondary-phone`}
          value={profile.secondaryPhone}
          onChange={(e) => set({ secondaryPhone: e.target.value })}
          disabled={disabled}
          placeholder={ETHIOPIA_PHONE_PLACEHOLDER}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-notes`}>{translate("receptionNotes")}</Label>
        <textarea
          id={`${idPrefix}-notes`}
          className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          value={profile.notes}
          onChange={(e) => set({ notes: e.target.value })}
          disabled={disabled}
          maxLength={500}
          placeholder="Allergies, preferences, family shared phone, etc."
        />
      </div>
    </div>
  );
}

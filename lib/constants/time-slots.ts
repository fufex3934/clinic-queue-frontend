/** Clinic booking slots (30-minute intervals). */
export const CLINIC_TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 17 && minute === 30) break;
      slots.push(
        `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      );
    }
  }
  return slots;
})();

export const MAX_APPOINTMENTS_PER_SLOT = 5;

import api from "@/lib/api";
import type {
  Appointment,
  ArriveAppointmentResponse,
  CreateAppointmentPayload,
} from "@/types";

export const appointmentService = {
  getByDate(date: string) {
    return api.get<Appointment[]>("/appointments", { params: { date } });
  },

  book(payload: CreateAppointmentPayload) {
    return api.post<Appointment>("/appointments/book", payload);
  },

  arrive(appointmentId: string) {
    return api.post<ArriveAppointmentResponse>(
      `/appointments/${appointmentId}/arrive`,
    );
  },
};

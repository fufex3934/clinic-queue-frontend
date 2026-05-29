import api from "@/lib/api";
import type {
  Appointment,
  ArriveAppointmentResponse,
  CreateAppointmentPayload,
} from "@/types";

type Scope = { clinicId?: string };

export const appointmentService = {
  getByDate(date: string, scope?: Scope) {
    return api.get<Appointment[]>("/appointments", {
      params: { date, ...scope },
    });
  },

  book(payload: CreateAppointmentPayload, scope?: Scope) {
    return api.post<Appointment>("/appointments/book", payload, {
      params: scope,
    });
  },

  arrive(appointmentId: string, scope?: Scope) {
    return api.post<ArriveAppointmentResponse>(
      `/appointments/${appointmentId}/arrive`,
      {},
      { params: scope },
    );
  },

  cancel(appointmentId: string, scope?: Scope) {
    return api.post<Appointment>(
      `/appointments/${appointmentId}/cancel`,
      {},
      { params: scope },
    );
  },

  confirm(appointmentId: string, scope?: Scope) {
    return api.post<Appointment>(
      `/appointments/${appointmentId}/confirm`,
      {},
      { params: scope },
    );
  },

  complete(appointmentId: string, scope?: Scope) {
    return api.post<Appointment>(
      `/appointments/${appointmentId}/complete`,
      {},
      { params: scope },
    );
  },

  noShow(appointmentId: string, scope?: Scope) {
    return api.post<Appointment>(
      `/appointments/${appointmentId}/no-show`,
      {},
      { params: scope },
    );
  },
};

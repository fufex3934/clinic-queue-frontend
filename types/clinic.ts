export interface Clinic {
  _id: string;
  name: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClinicPayload {
  name: string;
  location: string;
}

export interface UpdateClinicPayload {
  name?: string;
  location?: string;
}

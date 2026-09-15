export interface Appointment {
  id: number,
  ownerId: number,
  petId: number,
  vetId: number,
  startTime: string,
  endTime: string,
  reason: string,
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | string,
}

export interface AppointmentFields {
  petId: number,
  vetId: number,
  startTime: string,
  endTime: string,
  reason: string,
}

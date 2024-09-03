import { Appointment } from "../entities/Appointment";
import { Pacient } from "../entities/Pacient";

export interface AppointmentApi {
  getAppointmentsDate(date: string): Promise<Appointment[]> | [];
  getAppointment(id: number): Promise<Appointment> | [];
  cancelAppointment(id: string): Promise<boolean>;
  getPacient(link: string): Promise<Pacient | null>;
}

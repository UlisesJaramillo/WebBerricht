import { Appointment } from "../entities/Appointment";
import { Message } from "../entities/Message";

export interface AppointmentRepository {
  setProcessAppointment(date: string, processDate: string): Promise<boolean>;

  getAppointmentBetwenDate(
    dateStart: string,
    dateEnd: string
  ): Promise<Appointment[] | null>;

  getApointmentsByDate(date: string): Promise<Message[]>;
  getApointmentsByDateFiltered(
    date: string,
    yesterday: string
  ): Promise<Message[]>;
}

import { Appointment } from "../entities/Appointment";
import { Message } from "../entities/Message";

export interface AppointmentRepository {
  setProcessAppointment(date: string, processDate: string): Promise<boolean>;

  getAppointmentBetwenDate(
    dateStart: string,
    dateEnd: string
  ): Promise<Appointment[] | null>;
  countAppointment(idAppointment: string): Promise<number>;
  saveAppointments(message: Message): Promise<boolean>;
  updateAppointment(message: Message): Promise<boolean>;
  getApointmentsByDate(date: string): Promise<Message[]>;
  getApointmentsByDateFiltered(
    date: string,
    yesterday: string
  ): Promise<Message[]>;
}

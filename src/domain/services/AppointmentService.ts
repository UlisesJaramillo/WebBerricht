import { Appointment } from "../entities/Appointment";
import { Message } from "../entities/Message";
import { AppointmentApi } from "../interfaces/AppointmentApi";
import { AppointmentRepository } from "../interfaces/AppointmentRepository";

export class AppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private appointmentApi: AppointmentApi
  ) {
    console.log("Servicio creado: AppointmentService");
  }

  async getAppointmentsFilteredFromDB(
    date: string,
    yesterday: string
  ): Promise<Message[]> {
    return await this.appointmentRepository.getApointmentsByDateFiltered(
      date,
      yesterday
    );
  }

  async setProcessAppointment(
    date: string,
    processDate: string
  ): Promise<boolean> {
    return await this.appointmentRepository.setProcessAppointment(
      date,
      processDate
    );
  }
  async getAppointmentsFromDB(date: string): Promise<Message[]> {
    console.log("en el servicio!");
    return await this.appointmentRepository.getApointmentsByDate(date);
  }
  async getAppointmentsDate(date: string): Promise<Appointment[]> {
    console.log("en el servicio!");
    return await this.appointmentApi.getAppointmentsDate(date);
  }

  async countAppointment(idAppointment: string): Promise<number> {
    return await this.appointmentRepository.countAppointment(idAppointment);
  }
  async saveAppointments(messages: Message): Promise<boolean> {
    return await this.appointmentRepository.saveAppointments(messages);
  }
  async updateAppointment(message: Message): Promise<boolean> {
    return await this.appointmentRepository.updateAppointment(message);
  }

  async cancelAppointment(idAppointment: string): Promise<boolean> {
    return await this.appointmentApi.cancelAppointment(idAppointment);
  }
}

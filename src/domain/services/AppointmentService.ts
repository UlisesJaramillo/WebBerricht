import { Appointment } from "../entities/Appointment";
import { Message } from "../entities/Message";
import { AppointmentApi } from "../interfaces/AppointmentApi";
import { AppointmentRepository } from "../interfaces/AppointmentRepository";

export class AppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private appointmentApi: AppointmentApi
  ) {
    console.log("Service created: AppointmentService");
  }

  /**
   * Retrieves patient information for a given list of appointments from the API.
   * @param {Appointment[]} appointments - List of appointments.
   * @returns {Promise<Appointment[]>} - A promise that resolves to the list of appointments with patient information.
   */
  async getPatient(appointments: Appointment[]): Promise<Appointment[]> {
    return this.appointmentApi.getPacient(appointments);
  }

  /**
   * Retrieves filtered appointments from the database for a specific date and the day before.
   * @param {string} date - The date for which to retrieve appointments.
   * @param {string} yesterday - The previous day to filter appointments.
   * @returns {Promise<Message[]>} - A promise that resolves to a list of messages.
   */
  async getAppointmentsFilteredFromDB(
    date: string,
    yesterday: string
  ): Promise<Message[]> {
    return await this.appointmentRepository.getApointmentsByDateFiltered(
      date,
      yesterday
    );
  }

  /**
   * Sets the process status of appointments in the database.
   * @param {string} date - The date of the appointments.
   * @param {string} processDate - The date when the process was set.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  async setProcessAppointment(
    date: string,
    processDate: string
  ): Promise<boolean> {
    return await this.appointmentRepository.setProcessAppointment(
      date,
      processDate
    );
  }

  /**
   * Retrieves appointments from the database for a specific date.
   * @param {string} date - The date for which to retrieve appointments.
   * @returns {Promise<Message[]>} - A promise that resolves to a list of messages.
   */
  async getAppointmentsFromDB(date: string): Promise<Message[]> {
    console.log("In the service!");
    return await this.appointmentRepository.getApointmentsByDate(date);
  }

  /**
   * Retrieves appointments from the API for a specific date.
   * @param {string} date - The date for which to retrieve appointments.
   * @returns {Promise<Appointment[]>} - A promise that resolves to a list of appointments.
   */
  async getAppointmentsDate(date: string): Promise<Appointment[]> {
    console.log("In the service!");
    return await this.appointmentApi.getAppointmentsDate(date);
  }

  /**
   * Cancels an appointment using its ID.
   * @param {string} idAppointment - The ID of the appointment to be canceled.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  async cancelAppointment(idAppointment: string): Promise<boolean> {
    return await this.appointmentApi.cancelAppointment(idAppointment);
  }
}

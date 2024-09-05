import { Message } from "../../domain/entities/Message";
import { AppointmentService } from "../../domain/services/AppointmentService";

export class GetAppointmentsFromDB {
  constructor(private appointmentService: AppointmentService) {
    this.appointmentService = appointmentService; // Initialize the AppointmentService
    console.log("Class created: GetAppointmentsFromDB");
  }

  // Method to retrieve appointments from the database based on the given date
  async execute(date: string): Promise<Message[]> {
    // Call the service method to get appointments from the database
    return await this.appointmentService.getAppointmentsFromDB(date);
  }
}

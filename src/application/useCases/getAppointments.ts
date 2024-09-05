import { Message } from "../../domain/entities/Message";
import { AppointmentService } from "../../domain/services/AppointmentService";
import { MessageService } from "../../domain/services/MessageService";
import { ApiImpl } from "../../infraestructure/api/axios/implementation/apiImpl";

export class GetAppointments {
  constructor(
    private appointmentService: AppointmentService, // Service for handling appointment-related operations
    private messageService: MessageService, // Service for handling message-related operations
    private api: ApiImpl // API implementation for making requests
  ) {
    console.log("Class created: GetAppointments");
  }

  // Method to execute the retrieval and processing of appointments
  async execute(date: string): Promise<void> {
    // Retrieve appointments for the given date and get patient details
    const appointments = await this.appointmentService.getPatient(
      await this.appointmentService.getAppointmentsDate(date)
    );

    // Process each appointment
    appointments.forEach(async (appointment) => {
      // Extract professional and patient details, or use default values if not available
      const professionalName =
        appointment.professional?.name || "Name not available";
      const professionalLastname =
        appointment.professional?.lastname || "Lastname not available";
      const patientPhoneNumber =
        appointment.paciente?.phoneNumber || "phone number not available";
      const patientName = appointment.paciente?.name || "name not available";
      const patientLastname =
        appointment.paciente?.lastname || "lastname not available";

      // Create a new message object with the appointment details
      const message = new Message(
        appointment.id,
        patientPhoneNumber,
        appointment.fecha,
        appointment.hora,
        appointment.motivo,
        patientName,
        patientLastname,
        professionalName,
        professionalLastname
      );

      // Check if the appointment already exists in the database
      if ((await this.messageService.countMessages(message.idTurno)) === 0) {
        // If the appointment does not exist, save the message in the database
        await this.messageService.saveMessages(message);
        console.log("Appointment saved in the database");
      } else {
        // If the appointment exists, update the existing record
        await this.messageService.updateMessage(message);
        // Optionally, update the appointment details as well
        // await this.appointmentService.updateAppointment(message);
      }
    });

    // Log the processed appointments
    console.log(appointments);
  }
}

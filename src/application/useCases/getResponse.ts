import { AppointmentService } from "../../domain/services/AppointmentService";
import { MessageService } from "../../domain/services/MessageService";

export class GetResponse {
  constructor(
    private messageService: MessageService,
    private appointmentService: AppointmentService
  ) {
    console.log("Class created: GetResponse");
  }

  // Method to handle the response from the patient and manage the appointment accordingly
  async execute(response: string, phoneNumber: string) {
    let cancelado = ""; // Variable to store the cancellation status
    let respuestaAux: string = response.replace(/ /g, "").toLowerCase(); // Normalize response for comparison

    respuestaAux = await this.messageService.analizeMessage(response); //analiza por IA la respuesta
    // Check if the response indicates a cancellation
    if (["si", "sí", "SI", "Si"].includes(respuestaAux)) {
      cancelado = "si";
    }

    // Check if the response indicates no cancellation
    if (["no", "NO", "No"].includes(respuestaAux)) {
      cancelado = "no";
    }

    respuestaAux = response.replace(/\+/g, " "); // Replace '+' with space for readability

    // Construct the update query for the cancellation status
    const cancelaTurno = cancelado ? `cancela_turno = '${cancelado}', ` : "";

    // Determine if the appointment should be canceled based on the response
    // Save the response in the message service
    this.messageService.setResponse(cancelaTurno, response, phoneNumber);

    // Retrieve the appointment ID based on the phone number
    const idAppointment: string = await this.messageService.getIdAppointment(
      phoneNumber
    );

    // Cancel the appointment if the response indicates 'no'
    if (cancelado === "no") {
      this.appointmentService.cancelAppointment(idAppointment);
    }
  }
}

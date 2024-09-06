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
    let respuestaAux: string = response.replace(/\s+/g, "").toLowerCase(); // Normalize response for comparison

    //check if is already a response like NO in the DB
    console.log(respuestaAux);
    // Check if the response indicates a cancellation
    if (
      ["si", "sí", "SI", "Si"].some((item) => {
        item == respuestaAux;
      })
    ) {
      cancelado = "si";
    } else if (
      ["no", "NO", "No"].some((item) => {
        item == respuestaAux;
      })
    ) {
      // Check if the response indicates no cancellation
      cancelado = "no";
    } else {
      //respuestaAux = await this.messageService.analizeMessage(response); //Analize the response by AI
      response = this.evaluatePatiencResponse(response); // we use a local function with pre-defined responses
    }
    console.log(response);
    // Determine if the appointment should be canceled based on the response
    // Save the response in the message service
    this.messageService.setResponse(cancelado, response, phoneNumber);

    // Retrieve the appointment ID based on the phone number
    const idAppointment: string = await this.messageService.getIdAppointment(
      phoneNumber
    );

    // Cancel the appointment if the response indicates 'no'
    if (cancelado === "no") {
      this.appointmentService.cancelAppointment(idAppointment);
    }
  }
  patientResponses = {
    NO: [
      "sí, quiero cancelar el turno",
      "cancelo el turno",
      "quiero cancelar mi cita",
      "por favor, cancele mi turno",
      "no podré asistir, cancele el turno",
      "anulen la cita",
      "necesito cancelar el turno",
      "sí, no voy a ir",
      "por favor, anulen mi cita",
      "no podré ir, cancelo",
      "NO",
      "no",
      "No",
    ],
    SI: [
      "no, mantengo el turno",
      "no quiero cancelar",
      "quiero asistir a mi cita",
      "por favor, no cancelen el turno",
      "mantengo mi turno",
      "sí asistiré",
      "no, me quedo con el turno",
      "no, no quiero cancelar",
      "asistiré a mi turno",
      "confirmo que asistiré",
      "si",
      "sí",
      "SI",
      "Si",
    ],
    INDEFINIDO: [
      "no estoy seguro",
      "tengo que pensarlo",
      "no sé si podré ir",
      "quizá necesite cancelar",
      "aún no lo sé",
      "no estoy seguro si podré asistir",
      "lo confirmo más tarde",
      "puede que cancele, aún no sé",
      "déjame pensarlo",
      "no tengo claro si podré ir",
    ],
  };

  // Función que evalúa el mensaje del paciente y devuelve "SI", "NO" o "INDEFINIDO"
  private evaluatePatiencResponse(mensaje: string): string {
    // Convertir el mensaje a minúsculas para comparaciones case-insensitive
    const mensajeLower = mensaje.toLowerCase().trim();

    // Buscar en las listas de respuestas
    if (this.patientResponses.SI.some((response) => mensajeLower == response)) {
      return "SI";
    }

    if (this.patientResponses.NO.some((response) => mensajeLower == response)) {
      return "NO";
    }

    if (
      this.patientResponses.INDEFINIDO.some(
        (response) => mensajeLower == response
      )
    ) {
      return "INDEFINIDO";
    }

    // Si no coincide con ninguna, devolver "INDEFINIDO" por defecto
    return "INDEFINIDO";
  }
}

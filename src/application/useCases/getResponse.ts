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

    //check if is already a response like NO in the DB
    //respuestaAux = await this.messageService.analizeMessage(response); //Analize the response by AI
    respuestaAux = this.evaluarRespuestaPaciente(response);
    console.log(respuestaAux);
    // Check if the response indicates a cancellation
    if (["si", "sí", "SI", "Si"].includes(respuestaAux)) {
      cancelado = "si";
    }

    // Check if the response indicates no cancellation
    if (["no", "NO", "No"].includes(respuestaAux)) {
      cancelado = "no";
    }

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
  respuestasPaciente = {
    SI: [
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
    ],
    NO: [
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
  private evaluarRespuestaPaciente(mensaje: string): string {
    // Convertir el mensaje a minúsculas para comparaciones case-insensitive
    const mensajeLower = mensaje.toLowerCase().trim();

    // Buscar en las listas de respuestas
    if (
      this.respuestasPaciente.SI.some((respuesta) =>
        mensajeLower.includes(respuesta)
      )
    ) {
      return "SI";
    }

    if (
      this.respuestasPaciente.NO.some((respuesta) =>
        mensajeLower.includes(respuesta)
      )
    ) {
      return "NO";
    }

    if (
      this.respuestasPaciente.INDEFINIDO.some((respuesta) =>
        mensajeLower.includes(respuesta)
      )
    ) {
      return "INDEFINIDO";
    }

    // Si no coincide con ninguna, devolver "INDEFINIDO" por defecto
    return "INDEFINIDO";
  }
}

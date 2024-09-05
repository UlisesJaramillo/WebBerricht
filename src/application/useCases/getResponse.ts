import { AppointmentService } from "../../domain/services/AppointmentService";
import { MessageService } from "../../domain/services/MessageService";

export class GetResponse {
  constructor(
    private messageService: MessageService,
    private appointmentService: AppointmentService
  ) {
    console.log("clase creada: GetResponse");
  }

  async execute(response: string, phoneNumber: string) {
    let cancelado = "";
    let respuestaAux = response.replace(/ /g, "").toLowerCase();

    if (["si", "sí", "SI", "Si"].includes(respuestaAux)) {
      cancelado = "si";
    }

    if (["no", "NO", "No"].includes(respuestaAux)) {
      cancelado = "no";
    }

    respuestaAux = response.replace(/\+/g, " ");

    const cancelaTurno = cancelado ? `cancela_turno = '${cancelado}', ` : "";

    //we determine if cancel the apointment or not, it´s depends of the response
    //save the response

    this.messageService.setResponse(cancelaTurno, response, phoneNumber);
    const idAppointment: string = await this.messageService.getIdAppointment(
      phoneNumber
    );
    if (cancelado == "no") {
      this.appointmentService.cancelAppointment(idAppointment);
    }
  }
}

import { Message } from "../../domain/entities/Message";
import { AppointmentService } from "../../domain/services/AppointmentService";
import { MessageService } from "../../domain/services/MessageService";
import { ApiImpl } from "../../infraestructure/api/axios/implementation/apiImpl";

export class GetAppointments {
  constructor(
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private api: ApiImpl
  ) {
    console.log("clase creada: GetAppointments");
  }

  async execute(date: string): Promise<void> {
    const appments = await this.appointmentService.getPatient(
      await this.appointmentService.getAppointmentsDate(date)
    );

    appments.forEach(async (appment) => {
      const profesionalName =
        appment.professional?.name || "Nombre no disponible";
      const profesionalLastname =
        appment.professional?.lastname || "Apellido no disponible";
      const pacientePhoneNumber =
        appment.paciente?.phoneNumber || "teléfono no disponible";
      const pacienteName = appment.paciente?.name || "nombre no disponible";
      const pacienteLastname =
        appment.paciente?.lastname || "apellido no disponible";

      const message = new Message(
        appment.id,
        pacientePhoneNumber,
        appment.fecha,
        appment.hora,
        appment.motivo,
        pacienteName,
        pacienteLastname,
        profesionalName,
        profesionalLastname
      );
      //hacemos un conteo para verificar la existencia el turno

      if ((await this.messageService.countMessages(message.idTurno)) === 0) {
        //si el turno no existe
        // Guardar el turno y el mensaje en la base de datos
        await this.messageService.saveMessages(message);
        console.log("Turnoguardado en la base de datos");
      } else {
        //si el turno existe actualizamos el registro
        await this.messageService.updateMessage(message);
        //await this.appointmentService.updateAppointment(message);
      }
    });
    console.log(appments);
  }
}

import { Appointment } from "../../domain/entities/Appointment";
import { Message } from "../../domain/entities/Message";
import { AppointmentService } from "../../domain/services/AppointmentService";
import { ApiImpl } from "../../infraestructure/api/axios/implementation/apiImpl";

export class GetAppointments {
  constructor(
    private appointmentService: AppointmentService,
    private api: ApiImpl
  ) {
    console.log("clase creada: GetAppointments");
  }

  async execute(date: string): Promise<void> {
    // Escuchar el evento "appointmentReceived" para guardar el turno en la base de datos
    this.api.on("appointmentReceived", async (appointment: Appointment) => {
      //console.log("Turno recibido:", appointment);
      // Aquí puedes crear el mensaje correspondiente
      const profesionalName =
        appointment.professional?.name || "Nombre no disponible";
      const profesionalLastname =
        appointment.professional?.lastname || "Apellido no disponible";
      const pacientePhoneNumber =
        appointment.paciente?.phoneNumber || "teléfono no disponible";
      const pacienteName = appointment.paciente?.name || "nombre no disponible";
      const pacienteLastname =
        appointment.paciente?.lastname || "apellido no disponible";

      const message = new Message(
        appointment.id,
        pacientePhoneNumber,
        appointment.fecha,
        appointment.hora,
        appointment.motivo,
        pacienteName,
        pacienteLastname,
        profesionalName,
        profesionalLastname
      );
      //hacemos un conteo para verificar la existencia el turno

      if (
        (await this.appointmentService.countAppointment(message.idTurno)) === 0
      ) {
        //si el turno no existe
        // Guardar el turno y el mensaje en la base de datos
        await this.appointmentService.saveAppointments(message);
        console.log("Turnoguardado en la base de datos");
      } else {
        //si el turno existe actualizamos el registro
        await this.appointmentService.updateAppointment(message);
      }
    });

    await this.appointmentService.getAppointmentsDate(date);
  }
}

import { response } from "express";
import { AppointmentService } from "../../domain/services/AppointmentService";
import { MessageService } from "../../domain/services/MessageService";
import moment from "moment";
import { Message } from "../../domain/entities/Message";
import { environment } from "../../../environment";
import momenttimezone from "moment-timezone";
export class SendSms {
  constructor(
    private messageService: MessageService,
    private appointmentService: AppointmentService
  ) {
    this.messageService = messageService;
    console.log("clase creada: SendSms");
  }

  async execute(date: string): Promise<Message[]> {
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

    // Obtenemos todos los mensajes de la base de datos filtrados por la fecha y limitados a ayer
    const messages =
      await this.appointmentService.getAppointmentsFilteredFromDB(
        date,
        yesterday
      );

    // Formateamos todos los mensajes
    const formattedMessages = this.makeMessages(messages, "");

    // Enviamos los mensajes
    //const success = await this.messageService.sendSmsBlock(formattedMessages);
    const success = true;
    if (success) {
      const argentinaTime = momenttimezone
        .tz("America/Argentina/Buenos_Aires")
        .format("YYYY-MM-DD HH:mm:ss");
      this.appointmentService.setProcessAppointment(date, argentinaTime);
    }

    return messages;
  }

  private makeMessages(data: Message[], message: string) {
    data.forEach((element) => {
      message +=
        element.paciente_celular +
        "," +
        element.paciente_celular +
        "," +
        this.addTextFields(
          this.normalizeText(element.medico_nombre),
          this.normalizeText(element.medico_apellido),
          this.normalizeText(element.paciente_nombre),
          this.normalizeText(element.paciente_apellido),
          this.convertirFecha(element.turno_fecha),
          element.turno_hora
        ) +
        "\n";
    });
    return message;
  }
  /**
   * Convierte una fecha del formato YYYY-MM-DD al formato DD-MM-YYYY.
   * @param {string} fecha - La fecha en formato YYYY-MM-DD.
   * @returns {string} - La fecha en formato DD-MM-YYYY.
   */
  private convertirFecha(date: string) {
    // Dividir la fecha en partes (año, mes, día)
    const [year, month, day] = date.split("-");

    // Formatear la fecha en el nuevo formato DD-MM-YYYY
    return `${day}-${month}-${year}`;
  }

  private addTextFields = (
    medico_nombre: string,
    medico_apellido: string,
    paciente_nombre: string,
    paciente_apellido: string,
    turno_fecha: string,
    turno_hora: string
  ) => {
    return environment.MSJ.replace("<medico_nombre>", medico_nombre)
      .replace("<medico_apellido>", medico_apellido)
      .replace("<paciente_nombre>", paciente_nombre)
      .replace("<paciente_apellido>", paciente_apellido)
      .replace("<turno_fecha>", turno_fecha)
      .replace("<turno_hora>", turno_hora);
  };

  private normalizeText(text: string) {
    const accentsMap = new Map([
      ["á", "a"],
      ["é", "e"],
      ["í", "i"],
      ["ó", "o"],
      ["ú", "u"],
      ["Á", "A"],
      ["É", "E"],
      ["Í", "I"],
      ["Ó", "O"],
      ["Ú", "U"],
      ["ñ", "n"],
      ["Ñ", "N"],
      // Añadir más si es necesario
    ]);

    const specialCharsMap = new Map([
      ["@", "arroba"],
      ["#", "num"],
      ["$", "$"],
      ["%", "porcentaje"],
      ["&", "Y"],
      ["*", "asterisco"],
      // Añadir más si es necesario
    ]);

    let normalizedText = text;

    accentsMap.forEach((value, key) => {
      const regex = new RegExp(key, "g");
      normalizedText = normalizedText.replace(regex, value);
    });

    specialCharsMap.forEach((value, key) => {
      const regex = new RegExp(`\\${key}`, "g"); // Escapar caracteres especiales
      normalizedText = normalizedText.replace(regex, value);
    });

    return normalizedText;
  }
}

import { AppointmentService } from "../../domain/services/AppointmentService";
import { MessageService } from "../../domain/services/MessageService";
import moment from "moment";
import { Message } from "../../domain/entities/Message";
import { enviroments } from "../../../enviroments";
import momenttimezone from "moment-timezone";

export class SendSms {
  constructor(
    private messageService: MessageService,
    private appointmentService: AppointmentService
  ) {
    this.messageService = messageService;
    console.log("Class created: SendSms");
  }

  // Method to send SMS messages for the given date
  async execute(date: string): Promise<Message[]> {
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

    // Retrieve all messages from the database filtered by the date and limited to yesterday
    const messages =
      await this.appointmentService.getAppointmentsFilteredFromDB(
        date,
        yesterday
      );

    // Format all the messages for sending
    const formattedMessages = this.makeMessages(messages, "");

    // Send the messages (Caution: This is currently set to always succeed)
    // const success = await this.messageService.sendSmsBlock(formattedMessages);
    const success = true;
    if (success) {
      // Set the appointment processing status with the current time in Buenos Aires timezone
      const argentinaTime = momenttimezone
        .tz("America/Argentina/Buenos_Aires")
        .format("YYYY-MM-DD HH:mm:ss");
      this.appointmentService.setProcessAppointment(date, argentinaTime);
    }

    return messages;
  }

  // Helper method to format messages for sending
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
   * Converts a date from YYYY-MM-DD format to DD-MM-YYYY format.
   * @param {string} date - The date in YYYY-MM-DD format.
   * @returns {string} - The date in DD-MM-YYYY format.
   */
  private convertirFecha(date: string) {
    // Split the date into year, month, and day parts
    const [year, month, day] = date.split("-");

    // Format the date into the new DD-MM-YYYY format
    return `${day}-${month}-${year}`;
  }

  // Helper method to replace placeholders in the message template with actual values
  private addTextFields = (
    medico_nombre: string,
    medico_apellido: string,
    paciente_nombre: string,
    paciente_apellido: string,
    turno_fecha: string,
    turno_hora: string
  ) => {
    return enviroments.MSJ.replace("<medico_nombre>", medico_nombre)
      .replace("<medico_apellido>", medico_apellido)
      .replace("<paciente_nombre>", paciente_nombre)
      .replace("<paciente_apellido>", paciente_apellido)
      .replace("<turno_fecha>", turno_fecha)
      .replace("<turno_hora>", turno_hora);
  };

  // Helper method to normalize text by replacing accented characters and special symbols
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
      // Add more if needed
    ]);

    const specialCharsMap = new Map([
      ["@", "arroba"],
      ["#", "num"],
      ["$", "$"],
      ["%", "porcentaje"],
      ["&", "Y"],
      ["*", "asterisco"],
      // Add more if needed
    ]);

    let normalizedText = text;

    // Replace accented characters with their non-accented counterparts
    accentsMap.forEach((value, key) => {
      const regex = new RegExp(key, "g");
      normalizedText = normalizedText.replace(regex, value);
    });

    // Replace special characters with their textual representation
    specialCharsMap.forEach((value, key) => {
      const regex = new RegExp(`\\${key}`, "g"); // Escape special characters
      normalizedText = normalizedText.replace(regex, value);
    });

    return normalizedText;
  }
}

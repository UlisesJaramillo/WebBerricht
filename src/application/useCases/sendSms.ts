import { AppointmentService } from "../../domain/services/AppointmentService";
import { MessageService } from "../../domain/services/MessageService";
import moment from "moment";
import { Message } from "../../domain/entities/Message";
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
    let formattedMessages = "";

    messages.forEach((message) => {
      formattedMessages += message.makeMessage;
    });

    // Send the messages (Caution: This is currently set to always succeed)
    const success = await this.messageService.sendSmsBlock(formattedMessages);
    //const success = true;
    if (success) {
      // Set the appointment processing status with the current time in Buenos Aires timezone
      const argentinaTime = momenttimezone
        .tz("America/Argentina/Buenos_Aires")
        .format("YYYY-MM-DD HH:mm:ss");
      this.appointmentService.setProcessAppointment(date, argentinaTime);
    }

    return messages;
  }
}

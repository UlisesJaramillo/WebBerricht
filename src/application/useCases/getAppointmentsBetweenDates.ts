import { Message } from "../../domain/entities/Message";
import { MessageService } from "../../domain/services/MessageService";

export class GetAppointmentsBetweenDates {
  constructor(private messageService: MessageService) {
    this.messageService = messageService; // Initialize the AppointmentService
    console.log("Class created: GetAppointmentsBetweenDates");
  }

  // Method to retrieve appointments from the database based on the given date
  async execute(dateStart: string, dateEnd: string): Promise<Message[]> {
    // Call the service method to get appointments from the database
    return await this.messageService.getAppointmentsBetweenDate(
      dateStart,
      dateEnd
    );
    //return a collection of messages from DB
  }
}

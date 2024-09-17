import { Message } from "../entities/Message";

export interface MessageRepository {
  setResponse(
    cancelAppointment: string,
    response: string,
    phoneNumber: string
  ): Promise<Boolean>;
  getIdAppointment(phoneNumber: string): Promise<string>;
  updateMessage(message: Message): Promise<boolean>;
  countMessages(idAppointment: string): Promise<number>;
  saveMessages(message: Message): Promise<boolean>;
  getAppointmentBetweenDate(
    dateStart: string,
    dateEnd: string
  ): Promise<Message[]>;
}

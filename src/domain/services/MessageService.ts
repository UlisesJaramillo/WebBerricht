import { Message } from "../entities/Message";
import { MessageApi } from "../interfaces/MessageApi";
import { MessageRepository } from "../interfaces/MessageRepository";

export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private messageApi: MessageApi
  ) {
    console.log("Servicio creado: MessageService");
  }

  async setResponse(
    cancelAppointment: string,
    response: string,
    phoneNumber: string
  ): Promise<Boolean> {
    return await this.messageRepository.setResponse(
      cancelAppointment,
      response,
      phoneNumber
    );
  }

  async getIdAppointment(phoneNumber: string): Promise<string> {
    return await this.messageRepository.getIdAppointment(phoneNumber);
  }

  async sendSmsBlock(messages: string): Promise<boolean> {
    return this.messageApi.sendSmsBlock(messages);
  }

  async updateMessage(messages: Message): Promise<boolean> {
    return this.messageRepository.updateMessage(messages);
  }
  async countMessages(idAppointment: string): Promise<number> {
    return await this.messageRepository.countMessages(idAppointment);
  }

  async saveMessages(messages: Message): Promise<boolean> {
    return await this.messageRepository.saveMessages(messages);
  }
}

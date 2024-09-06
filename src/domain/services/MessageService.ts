import { Message } from "../entities/Message";
import { MessageApi } from "../interfaces/MessageApi";
import { MessageRepository } from "../interfaces/MessageRepository";
import { MessageIA } from "../interfaces/MessagesIA";

export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private messageApi: MessageApi,
    private messageIA: MessageIA
  ) {
    console.log("Service created: MessageService");
  }

  /**
   * Sets the response for a message in the repository.
   * @param {string} cancelAppointment - Indicates if the appointment is canceled.
   * @param {string} response - The response from the patient.
   * @param {string} phoneNumber - The phone number of the patient.
   * @returns {Promise<Boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
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

  /**
   * Retrieves the appointment ID associated with a phone number.
   * @param {string} phoneNumber - The phone number of the patient.
   * @returns {Promise<string>} - A promise that resolves to the appointment ID.
   */
  async getIdAppointment(phoneNumber: string): Promise<string> {
    return await this.messageRepository.getIdAppointment(phoneNumber);
  }

  /**
   * Sends a block of SMS messages using the message API.
   * @param {string} messages - The block of SMS messages to be sent.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  async sendSmsBlock(messages: string): Promise<boolean> {
    return this.messageApi.sendSmsBlock(messages);
  }

  /**
   * Updates a message in the repository.
   * @param {Message} messages - The message to be updated.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  async updateMessage(messages: Message): Promise<boolean> {
    return this.messageRepository.updateMessage(messages);
  }

  /**
   * Counts the number of messages associated with a given appointment ID.
   * @param {string} idAppointment - The ID of the appointment.
   * @returns {Promise<number>} - A promise that resolves to the count of messages.
   */
  async countMessages(idAppointment: string): Promise<number> {
    return await this.messageRepository.countMessages(idAppointment);
  }

  /**
   * Saves a message to the repository.
   * @param {Message} messages - The message to be saved.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  async saveMessages(messages: Message): Promise<boolean> {
    return await this.messageRepository.saveMessages(messages);
  }

  async analizeMessage(message: string): Promise<string> {
    return await this.messageIA.analizeMessage(message);
  }
}

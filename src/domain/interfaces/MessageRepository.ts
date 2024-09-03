export interface MessageRepository {
  setResponse(
    cancelAppointment: string,
    response: string,
    phoneNumber: string
  ): Promise<Boolean>;
  getIdAppointment(phoneNumber: string): Promise<string>;
}

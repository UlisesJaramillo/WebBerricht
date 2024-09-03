import { AppointmentIA } from "../../../domain/interfaces/AppointmentIA";

//IMPLEMENTACIÖN DE IA (CHAT GPT) para procesar las respuestas
export class IAImpl implements AppointmentIA {
  analizeMessage(message: string): string {
    throw new Error("Method not implemented.");
  }
}

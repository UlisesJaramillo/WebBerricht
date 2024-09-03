import { Appointment } from "../../domain/entities/Appointment";
import { Message } from "../../domain/entities/Message";
import { AppointmentService } from "../../domain/services/AppointmentService";

export class GetAppointmentsFromDB {
  constructor(private appointmentService: AppointmentService) {
    this.appointmentService = appointmentService;
    console.log("clase creada: GetAppointmentsFromDB");
  }

  async execute(date: string): Promise<Message[]> {
    //get all the appointments from DB

    return await this.appointmentService.getAppointmentsFromDB(date);
    //format all the appointments to a json
    //return this.appointmentService.getAppointmentsFromDB(date);
  }
}

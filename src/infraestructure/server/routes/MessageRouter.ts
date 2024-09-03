import { Router } from "express";
import { MessageController } from "../controller/MessageController";
import { RepositoryImpl } from "../../repository/sqlite/implementation/repositoryImpl";
import { GetAppointments } from "../../../application/useCases/getAppointments";
import { AppointmentService } from "../../../domain/services/AppointmentService";
import { ApiImpl } from "../../api/axios/implementation/apiImpl";
import { GetResponse } from "../../../application/useCases/getResponse";
import { MessageService } from "../../../domain/services/MessageService";
import { GetAppointmentsFromDB } from "../../../application/useCases/getAppointmentsFromDB";
import { SendSms } from "../../../application/useCases/sendSms";

const router = Router();
const repositoryImpl = new RepositoryImpl();
const apiImpl = new ApiImpl();
const appointmentService = new AppointmentService(repositoryImpl, apiImpl);
const getAppointments = new GetAppointments(appointmentService, apiImpl);
const messageService = new MessageService(repositoryImpl, apiImpl);
const getResponse = new GetResponse(messageService, appointmentService);
const getAppointmensDromDB = new GetAppointmentsFromDB(appointmentService);
const sendSms = new SendSms(messageService, appointmentService);
const messageController = new MessageController(
  getAppointments,
  getResponse,
  getAppointmensDromDB,
  sendSms
);

//Rutas para SMS
router.get("/enviarmensajes/:fecha", (req, res) => {
  messageController.sendMessagesController(req, res);
});

router.get("/respuesta/:numero", (req, res) => {
  messageController.getResponseController(req, res);
});

router.get("/entregarturnos/:fecha", (req, res) => {
  messageController.getAppointmentsFromDBController(req, res);
});

export default router;

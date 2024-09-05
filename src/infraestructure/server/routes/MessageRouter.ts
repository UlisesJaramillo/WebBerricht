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

// Instantiate repository, API, services, and use cases
const repositoryImpl = new RepositoryImpl();
const apiImpl = new ApiImpl();
const appointmentService = new AppointmentService(repositoryImpl, apiImpl);
const messageService = new MessageService(repositoryImpl, apiImpl);

// Create instances of use cases
const getAppointments = new GetAppointments(
  appointmentService,
  messageService,
  apiImpl
);
const getResponse = new GetResponse(messageService, appointmentService);
const getAppointmentsFromDB = new GetAppointmentsFromDB(appointmentService);
const sendSms = new SendSms(messageService, appointmentService);

// Instantiate the controller with the use cases
const messageController = new MessageController(
  getAppointments,
  getResponse,
  getAppointmentsFromDB,
  sendSms
);

// Define routes for SMS management
// Route to send messages based on the date
router.get("/enviarmensajes/:fecha", (req, res) => {
  messageController.sendMessagesController(req, res);
});

// Route to get responses based on phone number
router.get("/respuesta/:numero", (req, res) => {
  messageController.getResponseController(req, res);
});

// Route to retrieve appointments from the database based on the date
router.get("/entregarturnos/:fecha", (req, res) => {
  messageController.getAppointmentsFromDBController(req, res);
});

export default router;

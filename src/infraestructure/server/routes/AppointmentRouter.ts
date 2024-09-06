import { Router } from "express";
import { AppointmentController } from "../controller/AppointmentController";
import { GetAppointments } from "../../../application/useCases/getAppointments";
import { AppointmentService } from "../../../domain/services/AppointmentService";
import { RepositoryImpl } from "../../repository/sqlite/implementation/repositoryImpl";
import { ApiImpl } from "../../api/axios/implementation/apiImpl";
import { MessageService } from "../../../domain/services/MessageService";
import { IAImpl } from "../../IA/Implementation/IAImpl";

const router = Router();

// Instantiate repository, API, services, and use cases
const repositoryImpl = new RepositoryImpl();
const apiImpl = new ApiImpl();
const iaImpl = new IAImpl();
const messageService = new MessageService(repositoryImpl, apiImpl, iaImpl);
const appointmentService = new AppointmentService(repositoryImpl, apiImpl);
const getAppointment: GetAppointments = new GetAppointments(
  appointmentService,
  messageService,
  apiImpl
);

// Instantiate the controller with the use case
const appointmentController = new AppointmentController(getAppointment);

// Define routes for appointment management
// Route to get appointments by date
router.get("/obtenerTurnos/:fecha", (req, res) => {
  appointmentController.getAppointmentsController(req, res);
});

export default router;

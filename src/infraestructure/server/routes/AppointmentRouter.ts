import { Router } from "express";
import { AppointmentController } from "../controller/AppointmentController";
import { GetAppointments } from "../../../application/useCases/getAppointments";
import { AppointmentService } from "../../../domain/services/AppointmentService";
import { RepositoryImpl } from "../../repository/sqlite/implementation/repositoryImpl";
import { ApiImpl } from "../../api/axios/implementation/apiImpl";
import { MessageService } from "../../../domain/services/MessageService";

const router = Router();
const repositoryImpl = new RepositoryImpl();
const apiImpl = new ApiImpl();
const messageService = new MessageService(repositoryImpl, apiImpl);
const appointmentService = new AppointmentService(repositoryImpl, apiImpl);
const getAppointment: GetAppointments = new GetAppointments(
  appointmentService,
  messageService,
  apiImpl
);
const appointmentController = new AppointmentController(getAppointment);

// Rutas para ALEPHOO
router.get("/obtenerTurnos/:fecha", (req, res) => {
  appointmentController.getAppointmentsController(req, res);
});

export default router;

import { Router } from "express";

import appointmentRoutes from "../routes/AppointmentRouter";
import messageRoutes from "../routes/MessageRouter";

const routerExpress = Router();

// Definir todas mis rutas principales

routerExpress.use("/alephoo", appointmentRoutes);
routerExpress.use("/sms", messageRoutes);

export default routerExpress;

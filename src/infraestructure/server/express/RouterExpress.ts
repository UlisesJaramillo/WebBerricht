import { Router } from "express";

import appointmentRoutes from "../routes/AppointmentRouter";
import messageRoutes from "../routes/MessageRouter";

const routerExpress = Router();

// Define all main routes

// Route for appointment-related requests
routerExpress.use("/alephoo", appointmentRoutes);

// Route for SMS-related requests
routerExpress.use("/sms", messageRoutes);

export default routerExpress;

// src/controllers/messageController.ts

import { Request, Response } from "express";
import { GetAppointments } from "../../../application/useCases/getAppointments";

export class AppointmentController {
  constructor(private getAppointments: GetAppointments) {
    this.getAppointments = getAppointments;
  }

  getAppointmentsController(req: Request, res: Response) {
    try {
      const date = req.params.fecha;
      const data = this.getAppointments.execute(date);

      res.status(200).json({ ok: data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

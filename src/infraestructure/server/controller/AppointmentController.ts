// src/controllers/appointmentController.ts

import { Request, Response } from "express";
import { GetAppointments } from "../../../application/useCases/getAppointments";

export class AppointmentController {
  constructor(private getAppointments: GetAppointments) {}

  async getAppointmentsController(req: Request, res: Response): Promise<void> {
    try {
      const date = req.params.fecha;
      const data = await this.getAppointments.execute(date); // Await the asynchronous method

      res.status(200).json({ ok: data });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

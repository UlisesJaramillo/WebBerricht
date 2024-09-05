// src/controllers/messageController.ts

import { Request, Response } from "express";
import { GetAppointments } from "../../../application/useCases/getAppointments";
import { GetResponse } from "../../../application/useCases/getResponse";
import { GetAppointmentsFromDB } from "../../../application/useCases/getAppointmentsFromDB";
import { SendSms } from "../../../application/useCases/sendSms";

export class MessageController {
  constructor(
    private getAppointments: GetAppointments,
    private getResponse: GetResponse,
    private getAppointmentsFromDB: GetAppointmentsFromDB,
    private sendSms: SendSms
  ) {
    console.log("Clase creada: MessageController");
  }

  async getAppointmentsFromDBController(
    req: Request,
    res: Response
  ): Promise<void> {
    const date = req.params.fecha;
    try {
      const data = await this.getAppointmentsFromDB.execute(date); // Await the asynchronous method
      console.log(data);
      res.status(200).json({ ok: "ok", respuesta: data });
    } catch (error) {
      console.error("Error fetching appointments from DB:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async sendMessagesController(req: Request, res: Response): Promise<void> {
    const date = req.params.fecha;
    try {
      const data = await this.sendSms.execute(date); // Await the asynchronous method
      res.status(200).json({ ok: "ok", respuesta: data });
    } catch (error) {
      console.error("Error sending messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getResponseController(req: Request, res: Response): Promise<void> {
    const { numero } = req.params;
    const response: string = req.query.mensaje as string;

    try {
      await this.getResponse.execute(response, numero); // Await the asynchronous method
      res.status(200).json({ ok: "ok" });
    } catch (error) {
      console.error("Error processing response:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

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
    private getAppointmensFromDB: GetAppointmentsFromDB,
    private sendSms: SendSms
  ) {
    this.getAppointments = getAppointments;
    this.getResponse = getResponse;
    console.log("clase creada: MessageController");
  }

  getAppointmentsFromDBController(req: Request, res: Response) {
    const date = req.params.fecha;
    try {
      this.getAppointmensFromDB.execute(date).then((data) => {
        console.log(data);
        res.status(200).json({ ok: "ok", respuesta: data });
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  sendMessagesController(req: Request, res: Response) {
    const date = req.params.fecha;
    try {
      this.sendSms.execute(date).then((data) => {
        res.status(200).json({ ok: "ok", respuesta: data });
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  getResponseController(req: Request, res: Response) {
    const { numero } = req.params;
    const response: string = req.query.mensaje as string;

    try {
      this.getResponse.execute(response, numero);
      res.status(200).json({ ok: "ok" });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

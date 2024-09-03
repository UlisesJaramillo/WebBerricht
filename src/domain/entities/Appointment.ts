import { Pacient } from "./Pacient";
import { Professional } from "./Professional";

export class Appointment {
  constructor(
    public id: string,
    public fecha: string,
    public hora: string,
    public paciente: Pacient | null,
    public professional: Professional | null,
    public motivo: string
  ) {}
}

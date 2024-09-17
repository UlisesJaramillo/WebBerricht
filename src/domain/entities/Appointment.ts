import { Pacient } from "./Pacient";
import { Professional } from "./Professional";

export class Appointment {
  constructor(
    public id: string,
    public fecha: string,
    public hora: string,
    public sede: string,
    public paciente: Pacient | null,
    public professional: Professional | null,
    public motivo: string,
    public patientLink: string
  ) {}

  public isDiscarted(
    professionalsToFilter: string[] // colección de nombres completos a descartar
  ): boolean {
    if (!this.professional) return false; // Si no hay profesional, no se descarta
    const fullname = `${this.professional.name} ${this.professional.lastname}`;
    return professionalsToFilter.includes(fullname); // Verifica si el profesional está en la lista de descartados
  }
}

export class Message {
  constructor(
    public idTurno: string,
    public paciente_celular: string,
    public turno_fecha: string,
    public turno_hora: string,
    public motivo: string,
    public paciente_nombre: string,
    public paciente_apellido: string,
    public medico_nombre: string,
    public medico_apellido: string,
    public fecha_procesado?: string,
    public fecha_respuesta?: string,
    public cancela_turno?: string
  ) {}
}

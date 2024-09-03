import axios from "axios";
import { Appointment } from "../../../../domain/entities/Appointment";
import { AppointmentApi } from "../../../../domain/interfaces/AppointmentApi";
import { MessageApi } from "../../../../domain/interfaces/MessageApi";
import { Pacient } from "../../../../domain/entities/Pacient";
import { Professional } from "../../../../domain/entities/Professional";
import { EventEmitter } from "events";
const username = "juan.hidalgo";
const password = "Prueba2024";
const basicAuth = "Basic " + btoa(username + ":" + password);

export class ApiImpl
  extends EventEmitter
  implements AppointmentApi, MessageApi
{
  async getPacient(link: string): Promise<Pacient | null> {
    const patient = new Pacient("1", "", "", "");
    try {
      const response = await axios.request({
        method: "get",
        maxBodyLength: Infinity,
        url: link,
        headers: {
          Authorization: basicAuth,
          Cookie: "ci_session=5ii3jc9v79j7i0o2s98o4bb14mishs4b",
        },
      });

      const { id, attributes } = response.data.data;
      patient.setAll(
        id,
        attributes.nombres,
        attributes.apellidos,
        attributes.celular.replace(/\s+/g, "")
      );

      return patient;
    } catch (error) {
      console.error("Error en llamada personas", error);
      return null;
    }
  }

  async getAppointmentsDate(date: string): Promise<Appointment[] | []> {
    // Configuración de la solicitud para obtener los turnos
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://clinicadrrana.alephoo.com/api/v3/admision/turnos?filter[fecha]=${date}&filter[nocancelado]=1`,
      headers: {
        Authorization: basicAuth,
        Cookie: "ci_session=5ii3jc9v79j7i0o2s98o4bb14mishs4b",
      },
    };

    await axios
      .request(config)
      .then((response: any) => {
        const colTurnos = response.data.data;
        const data = response.data.data;
        const included = response.data.included;
        //console.log(response.data.data);
        // Procesar cada turno
        if (colTurnos.length > 0) {
          colTurnos.forEach(async (appointment: any) => {
            if (appointment.relationships.persona.data != null) {
              let idTurno = appointment.id;
              let linkPaciente = appointment.relationships.persona.links.self;
              // Obtener información del paciente
              await this.getPacient(linkPaciente).then((itemPaciente) => {
                const professional: Professional = this.obtenerProfesional(
                  appointment,
                  included
                );

                const appment = new Appointment(
                  idTurno,
                  appointment.attributes.fecha,
                  appointment.attributes.hora,
                  itemPaciente,
                  professional,
                  ""
                );
                //emitir evento del turno para ser guardado
                this.emit("appointmentReceived", appment);
              });
            } else {
              console.log("No tiene relación persona");
            }
          });
        }
      })
      .catch((error: any) => {
        console.error("Error en llamada turnos", error);
      });

    //armar coleccion de appointments
    return [];
  }
  getAppointment(id: number): Promise<Appointment> | [] {
    throw new Error("Method not implemented.");
  }
  async cancelAppointment(idTurno: string): Promise<boolean> {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://clinicadrrana.alephoo.com/api/v3/admision/turnos/${idTurno}`,
      headers: {
        Authorization: basicAuth,
        Cookie: "ci_session=f44jgof0hv5novb696cnfhgkq21mop3a",
      },
    };

    try {
      const response = await axios.request(config);
      const body = response.data;

      // Modificar el campo del estado del turno
      body.data.relationships.estadoTurno.data.id = 3;

      // Configuración de la solicitud POST para actualizar el estado del turno
      const configPost = {
        method: "put",
        maxBodyLength: Infinity,
        url: `https://clinicadrrana.alephoo.com/api/v3/admision/turnos/${idTurno}`,
        headers: {
          Authorization: basicAuth,
          Cookie: "ci_session=f44jgof0hv5novb696cnfhgkq21mop3a",
        },
        data: body,
      };

      await axios.request(configPost);
      return true;
    } catch (error) {
      console.error("Error al cancelar el turno:", error);
      return false;
    }
  }

  sendSmsBlock(messages: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  private obtenerProfesional(turno: any, included: any) {
    let idPersonal = this.obtenerIdPersonal(turno, included);
    let personalMedico = this.findPersonById(
      included,
      idPersonal,
      "Admin\\Personal"
    );
    let idMedico = personalMedico.relationships.persona.data.id;
    let medico = this.findPersonById(included, idMedico, "Admin\\Persona");
    let medicoNombre = medico.attributes.nombres;
    let medicoApellido = medico.attributes.apellidos;
    const profesional = new Professional(
      idMedico,
      medicoNombre,
      medicoApellido
    );

    return profesional;
  }
  /**
   * Obtiene el ID del personal a través del turno.
   * @param {object} turno - Datos del turno.
   * @param {array} included - Datos incluidos en la respuesta de la API.
   * @returns {string} - ID del personal.
   */
  private obtenerIdPersonal(turno: any, included: any): string {
    let idAgenda = turno.relationships.agenda.data.id;
    let agenda = this.findPersonById(included, idAgenda, "Admision\\Agenda");
    let idPersonal = agenda.relationships.profesional.data.id;
    return idPersonal;
  }
  /**
   * Encuentra una persona por su ID en el arreglo de datos.
   * @param {array} data - Arreglo de datos.
   * @param {string} id - ID de la persona.
   * @param {string} type - Tipo de persona.
   * @returns {object} - Persona encontrada.
   */
  private findPersonById(data: any[], id: any, type: string) {
    return data.find((item) => item.type === type && item.id === id);
  }
}

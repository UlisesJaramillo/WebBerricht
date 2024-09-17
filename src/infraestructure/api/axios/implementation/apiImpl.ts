import axios from "axios";
import { Appointment } from "../../../../domain/entities/Appointment";
import { AppointmentApi } from "../../../../domain/interfaces/AppointmentApi";
import { MessageApi } from "../../../../domain/interfaces/MessageApi";
import { Pacient } from "../../../../domain/entities/Pacient";
import { Professional } from "../../../../domain/entities/Professional";
import { EventEmitter } from "events";
import { enviroments } from "../../../../../enviroments";
import qs from "qs";
const username = enviroments.USER;
const password = enviroments.PASSWORD;
const basicAuth = "Basic " + btoa(username + ":" + password);

export class ApiImpl
  extends EventEmitter
  implements AppointmentApi, MessageApi
{
  /**
   * Retrieves patient information for a list of appointments by calling an external API.
   * Updates each appointment with the corresponding patient information.
   *
   * @param {Appointment[]} appointments - List of appointments to be updated with patient data.
   * @returns {Promise<Appointment[]>} - A promise that resolves to the list of updated appointments.
   */
  async getPacient(appointments: Appointment[]): Promise<Appointment[]> {
    try {
      // Use map to create a list of promises
      const updatedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          // Make an API call for each appointment to retrieve patient data
          try {
            const response = await axios.request({
              method: "get",
              maxBodyLength: Infinity,
              url: appointment.patientLink, // Use the patient link from the appointment
              headers: {
                Authorization: basicAuth,
                Cookie: "ci_session=5ii3jc9v79j7i0o2s98o4bb14mishs4b",
              },
            });

            const { id, attributes } = response.data.data;

            // Create the Pacient object with the retrieved information
            const patient = new Pacient(
              id,
              attributes.nombres,
              attributes.apellidos,
              attributes.celular.replace(/\s+/g, "") // Remove spaces from phone number
            );

            // Update the appointment with the patient data
            appointment.paciente = patient;
          } catch (error) {
            console.error(
              `Error retrieving patient data for appointment ${appointment.id}`,
              error
            );
            // Continue to the next appointment if there's an error
          }

          // Return the updated appointment
          return appointment;
        })
      );

      // Return the list of updated appointments
      return updatedAppointments;
    } catch (error) {
      console.error("Error retrieving patient data", error);
      return appointments; // Return original appointments list in case of error
    }
  }

  /**
   * Retrieves appointments for a specific date by calling an external API.
   * Each appointment is populated with patient and professional information.
   *
   * @param {string} date - The date for which to retrieve appointments.
   * @returns {Promise<Appointment[]>} - A promise that resolves to a list of appointments.
   */
  async getAppointmentsDate(date: string): Promise<Appointment[]> {
    try {
      // API request configuration to fetch appointments
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${enviroments.URLAPI}/admision/turnos?filter[fecha]=${date}&filter[nocancelado]=1`,
        headers: {
          Authorization: basicAuth,
          Cookie: "ci_session=5ii3jc9v79j7i0o2s98o4bb14mishs4b",
        },
      };

      const response = await axios.request(config);
      const colTurnos = response.data.data;
      const included = response.data.included;

      if (colTurnos.length === 0) {
        console.log("No available appointments.");
        return [];
      }

      // Use map to create a list of appointment promises
      const appmentPromises = colTurnos.map(async (appointment: any) => {
        if (appointment.relationships.persona.data != null) {
          const idTurno = appointment.id;
          const linkPaciente = appointment.relationships.persona.links.self;

          const professional: Professional = this.obtenerProfesional(
            appointment,
            included
          );

          const sede = this.obtenerSede(appointment, included);

          //obtenerSede

          // Create a new Appointment object
          return new Appointment(
            idTurno,
            appointment.attributes.fecha,
            appointment.attributes.hora,
            sede,
            null,
            professional,
            "",
            linkPaciente
          );
        } else {
          console.log("No patient relationship found.");
          return null;
        }
      });

      // Wait for all promises to resolve
      const appment = (await Promise.all(appmentPromises)).filter(Boolean);

      return appment as Appointment[];
    } catch (error) {
      console.error("Error fetching appointments", error);
      return [];
    }
  }

  /**
   * Placeholder for retrieving a specific appointment by its ID.
   * Currently not implemented.
   *
   * @param {number} id - The ID of the appointment to retrieve.
   * @returns {Promise<Appointment> | []} - Throws an error indicating the method is not implemented.
   */
  getAppointment(id: number): Promise<Appointment> | [] {
    throw new Error("Method not implemented.");
  }

  /**
   * Cancels an appointment by updating its status via an external API.
   *
   * @param {string} idTurno - The ID of the appointment to cancel.
   * @returns {Promise<boolean>} - A promise that resolves to `true` if the cancellation is successful, or `false` if it fails.
   */
  async cancelAppointment(idTurno: string): Promise<boolean> {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: enviroments.URLAPI + `/admision/turnos/${idTurno}`,
      headers: {
        Authorization: basicAuth,
        Cookie: "ci_session=f44jgof0hv5novb696cnfhgkq21mop3a",
      },
    };

    try {
      const response = await axios.request(config);
      const body = response.data;

      // Update appointment status
      body.data.relationships.estadoTurno.data.id = 3;

      // API request configuration for updating the appointment status
      const configPost = {
        method: "put",
        maxBodyLength: Infinity,
        url: enviroments.URLAPI + `/admision/turnos/${idTurno}`,
        headers: {
          Authorization: basicAuth,
          Cookie: "ci_session=f44jgof0hv5novb696cnfhgkq21mop3a",
        },
        data: body,
      };

      await axios.request(configPost);
      return true;
    } catch (error) {
      console.error("Error canceling appointment:", error);
      return false;
    }
  }

  /**
   * Sends a block of SMS messages.
   *
   * @param {string} messages - The message block to send.
   * @returns {Promise<boolean>} - Resolves to true if the operation was successful, otherwise false.
   */
  async sendSmsBlock(messages: string): Promise<boolean> {
    const data = qs.stringify({
      usuario: enviroments.SMS_MASIVO_USER,
      clave: enviroments.SMS_MASIVO_PASSWORD,
      bloque: messages,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: enviroments.SMS_MASIVO_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    try {
      const response = await axios(config);

      if (response.data === "OK") {
        console.log("Message sent successfully");
        return true;
      } else {
        console.log("Failed to send message");
        return false;
      }
    } catch (error) {
      console.error("Axios request error:", error);
      return false;
    }
  }

  /**
   * Retrieves the professional associated with an appointment.
   *
   * @param {object} turno - The appointment object containing relationships.
   * @param {array} included - Additional data included in the API response.
   * @returns {Professional} - The professional associated with the appointment.
   */
  private obtenerProfesional(turno: any, included: any): Professional {
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
   * Retrieves the personal ID from the appointment data.
   *
   * @param {object} turno - The appointment object containing relationships.
   * @param {array} included - Additional data included in the API response.
   * @returns {string} - The personal ID associated with the appointment.
   */
  private obtenerIdPersonal(turno: any, included: any): string {
    let idAgenda = turno.relationships.agenda.data.id;
    let agenda = this.findPersonById(included, idAgenda, "Admision\\Agenda");
    let idPersonal = agenda.relationships.profesional.data.id;
    return idPersonal;
  }

  /**
   * Finds a person by their ID in the provided data array.
   *
   * @param {array} data - The data array to search.
   * @param {string} id - The ID of the person to find.
   * @param {string} type - The type of person to find (e.g., "Admin\\Personal").
   * @returns {object} - The person object matching the ID and type.
   */
  private findPersonById(data: any[], id: any, type: string) {
    return data.find((item) => item.type === type && item.id === id);
  }

  /**
   * Retrieves the institution (sede) where the appointment is held.
   *
   * @param {object} turno - The appointment object containing relationships.
   * @param {array} included - Additional data included in the API response.
   * @returns {string} - The name of the institution (sede).
   */
  private obtenerSede(turno: any, included: any): string {
    // Find the agenda associated with the appointment
    let agendaId = turno.relationships.agenda.data.id;

    // Find the agenda in the included data
    let agenda = this.findById(included, agendaId, "Admision\\Agenda");

    if (!agenda) {
      return "";
    }

    // Get the institution (sede) ID from the agenda relationships
    let institucionId = agenda.relationships.institucion.data.id;

    // Find the institution in the included data
    let institucion = this.findById(
      included,
      institucionId,
      "Admin\\Institucion"
    );

    if (!institucion) {
      return "";
    }

    // Return the name of the institution
    return institucion.attributes.nombre;
  }

  /**
   * Helper method to find an entity by ID and type in the included array.
   *
   * @param {array} included - The included data from the API response.
   * @param {string} id - The ID of the entity to find.
   * @param {string} type - The type of the entity to find.
   * @returns {object} - The entity if found, or null if not found.
   */
  private findById(included: any[], id: string, type: string): any {
    return (
      included.find((item: any) => item.id === id && item.type === type) || null
    );
  }
}

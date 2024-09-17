import { Appointment } from "../../../../domain/entities/Appointment";
import { AppointmentRepository } from "../../../../domain/interfaces/AppointmentRepository";
import { MessageRepository } from "../../../../domain/interfaces/MessageRepository";
import { Message } from "../../../../domain/entities/Message";
import sqlite3 from "sqlite3";

export class RepositoryImpl
  implements AppointmentRepository, MessageRepository
{
  private db: sqlite3.Database;

  constructor() {
    // Initialize the SQLite database connection
    this.db = new sqlite3.Database("./turnosDB.db");
  }

  /**
   * Retrieves the appointment ID based on the phone number.
   * @param {string} phoneNumber - The phone number of the patient.
   * @returns {Promise<string>} - A promise that resolves to the appointment ID.
   */
  async getIdAppointment(phoneNumber: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT idTurno FROM messages WHERE id_message=(SELECT id_message FROM messages WHERE paciente_celular = ? ORDER BY fecha_procesado DESC LIMIT 1)`,
        [phoneNumber],
        (err, rows: Message[]) => {
          if (err) {
            console.error("Error during query:", err);
            reject(err); // Reject the promise if there is an error
          } else {
            resolve(rows[0].idTurno); // Resolve the appointment ID
          }
        }
      );
    });
  }

  /**
   * Retrieves appointments filtered by date and other conditions.
   * @param {string} date - The date to filter appointments.
   * @param {string} yesterday - The comparison date to filter out older appointments.
   * @returns {Promise<Message[]>} - A promise that resolves to an array of filtered appointments.
   */
  async getApointmentsByDateFiltered(
    date: string,
    yesterday: string
  ): Promise<Message[]> {
    try {
      return await new Promise((resolve, reject) => {
        this.db.all(
          "SELECT * FROM messages WHERE fecha_procesado IS NULL AND paciente_nombre NOT LIKE 'null' AND paciente_apellido NOT LIKE 'null' AND paciente_celular NOT LIKE 'null' AND medico_nombre NOT LIKE 'undefined' AND medico_apellido NOT LIKE 'undefined' AND turno_fecha LIKE ? AND turno_fecha > ? ORDER BY turno_fecha DESC;",
          [date, yesterday],
          (err, rows: Message[]) => {
            if (err) {
              console.error("Error during query:", err);
              reject(err); // Reject the promise if there is an error
            } else {
              resolve(rows); // Resolve with the filtered appointments
            }
          }
        );
      });
    } catch (error) {
      console.error("Error during query:", error);
      return [];
    }
  }

  /**
   * Retrieves appointments based on a specific date.
   * @param {string} date - The date to filter appointments.
   * @returns {Promise<Message[]>} - A promise that resolves to an array of appointments for the given date.
   */
  async getApointmentsByDate(date: string): Promise<Message[]> {
    try {
      return await new Promise((resolve, reject) => {
        this.db.all(
          `SELECT * FROM messages WHERE turno_fecha LIKE ?`,
          [`%${date}%`],
          (err, rows: Message[]) => {
            if (err) {
              console.error("Error during query:", err);
              reject(err); // Reject the promise if there is an error
            } else {
              resolve(rows); // Resolve with the appointments
            }
          }
        );
      });
    } catch (error) {
      console.error("Error during query:", error);
      return [];
    }
  }

  /**
   * Updates the response for an appointment and patient based on phone number.
   * @param {string} cancelAppointment - Indicates if the appointment is canceled.
   * @param {string} response - The response from the patient.
   * @param {string} phoneNumber - The phone number of the patient.
   * @returns {Promise<Boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  async setResponse(
    cancelado: string,
    response: string,
    phoneNumber: string
  ): Promise<Boolean> {
    // Construct the update query for the cancellation status
    const cancelaTurno = cancelado ? `cancela_turno = '${cancelado}', ` : "";
    return await new Promise((resolve, reject) => {
      this.db.all(
        `UPDATE messages SET fecha_respuesta = datetime('now','localtime'), ${cancelaTurno}  mensaje_paciente='${response}' WHERE id_message=(SELECT id_message FROM messages WHERE paciente_celular='${phoneNumber}' ORDER BY fecha_procesado DESC LIMIT 1)`,
        [],
        (err, rows: Message[]) => {
          if (err) {
            console.error("Error during query:", err);
            reject(false); // Reject the promise if there is an error
          } else {
            resolve(true); // Resolve true if the update was successful
          }
        }
      );
    });
  }

  /**
   * Sets the process date for appointments matching the given criteria.
   * @param {string} date - The date to filter appointments.
   * @param {string} processDate - The date to set as the process date.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  async setProcessAppointment(
    date: string,
    processDate: string
  ): Promise<boolean> {
    try {
      return await new Promise((resolve, reject) => {
        this.db.all(
          `UPDATE messages SET fecha_procesado = ? WHERE fecha_procesado IS NULL AND paciente_nombre NOT LIKE 'name not available' AND paciente_apellido NOT LIKE 'lastname not available' AND paciente_celular NOT LIKE 'phone number not available' AND medico_nombre NOT NULL AND medico_apellido NOT NULL AND turno_fecha LIKE ?;`,
          [processDate, date],
          (err, rows: Message[]) => {
            if (err) {
              console.error("Error during query:", err);
              reject(false); // Reject the promise if there is an error
            } else {
              resolve(true); // Resolve true if the update was successful
            }
          }
        );
      });
    } catch (error) {
      console.error("Error during query:", error);
      return false;
    }
  }

  /**
   * Retrieves messages (appointments) between two specified dates.
   * @param {string} dateStart - The start date of the range (inclusive).
   * @param {string} dateEnd - The end date of the range (inclusive).
   * @returns {Promise<Message[]>} - A promise that resolves to an array of messages within the date range or an empty array if none are found.
   */
  async getAppointmentBetweenDate(
    dateStart: string,
    dateEnd: string
  ): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM messages WHERE turno_fecha >= ? AND turno_fecha <= ?",
        [dateStart, dateEnd],
        (err, rows: Message[]) => {
          if (err) {
            console.error("Error during query:", err);
            return reject(err); // Reject the promise if there is an error
          }
          resolve(rows); // Resolve with the count of messages
        }
      );
    });
  }

  /**
   * Counts the number of messages associated with an appointment.
   * @param {string} idAppointment - The ID of the appointment.
   * @returns {Promise<number>} - A promise that resolves to the count of messages.
   */
  countMessages(idAppointment: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT COUNT(*) AS count FROM messages WHERE idTurno = ?",
        [idAppointment],
        (err, row: any) => {
          if (err) {
            console.error("Error during query:", err);
            return reject(err); // Reject the promise if there is an error
          }
          //console.log("Query successful:", row[0].count);
          resolve(row[0].count); // Resolve with the count of messages
        }
      );
    });
  }

  /**
   * Saves a message to the database.
   * @param {Message} message - The message to be saved.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  async saveMessages(message: Message): Promise<boolean> {
    try {
      const query = `
      INSERT INTO messages (
        paciente_nombre, 
        paciente_apellido, 
        medico_nombre, 
        medico_apellido, 
        turno_fecha, 
        turno_hora,
        turno_sede, 
        paciente_celular, 
        idTurno
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      this.db.run(query, [
        message.paciente_nombre,
        message.paciente_apellido,
        message.medico_nombre,
        message.medico_apellido,
        message.turno_fecha,
        message.turno_hora,
        message.turno_sede,
        message.paciente_celular,
        message.idTurno,
      ]);
    } catch (error) {
      return new Promise(() => false); // Return false in case of error
    }
    return new Promise(() => true); // Return true if the message is saved successfully
  }

  /**
   * Updates a message's details, avoiding updates if patient data is unavailable.
   * @param {Message} message - The message with updated details.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success or failure.
   */
  updateMessage(message: Message): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if patient data contains unavailable values
      if (
        message.paciente_nombre === "Nombre no disponible" ||
        message.paciente_apellido === "Apellido no disponible" ||
        message.paciente_celular === "teléfono no disponible"
      ) {
        console.log(
          "Some patient data is unavailable. The message will not be updated."
        );
        return resolve(false); // Resolve false if data is unavailable
      }

      // SQL query to update the message
      const query = `
      UPDATE messages
      SET 
        paciente_nombre = ?, 
        paciente_apellido = ?, 
        medico_nombre = ?, 
        medico_apellido = ?, 
        turno_fecha = ?, 
        turno_hora = ?,
        turno_sede = ?, 
        paciente_celular = ?
      WHERE idTurno = ?
    `;

      // Execute the update query
      this.db.run(
        query,
        [
          message.paciente_nombre,
          message.paciente_apellido,
          message.medico_nombre,
          message.medico_apellido,
          message.turno_fecha,
          message.turno_hora,
          message.turno_sede,
          message.paciente_celular,
          message.idTurno,
        ],
        function (err) {
          if (err) {
            console.error("Error during query:", err);
            return reject(err); // Reject the promise if there is an error
          }
          if (this.changes > 0) {
            //console.log(`Successfully updated ${this.changes} record(s).`);
            resolve(true); // Resolve true if records were updated
          } else {
            console.log("No record found with the specified idTurno.");
            resolve(false); // Resolve false if no records were updated
          }
        }
      );
    });
  }
}

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
    this.db = new sqlite3.Database("./database.db");
  }

  // Retrieve the appointment ID based on the phone number
  async getIdAppointment(phoneNumber: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT idTurno FROM messages WHERE id_message=(SELECT id_message FROM messages WHERE paciente_celular = ? ORDER BY fecha_procesado DESC LIMIT 1)`,
        [`%${phoneNumber}%`],
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

  // Retrieve appointments filtered by date and other conditions
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

  // Retrieve appointments based on a specific date
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

  // Update the response for an appointment and patient based on phone number
  async setResponse(
    cancelAppointment: string,
    response: string,
    phoneNumber: string
  ): Promise<Boolean> {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `UPDATE messages SET fecha_respuesta = datetime('now','localtime'), ${cancelAppointment}  mensaje_paciente='${response}' WHERE id_message=(SELECT id_message FROM messages WHERE paciente_celular='${phoneNumber}' ORDER BY fecha_procesado DESC LIMIT 1)`,
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

  // Set the process date for appointments matching the given criteria
  async setProcessAppointment(
    date: string,
    processDate: string
  ): Promise<boolean> {
    try {
      return await new Promise((resolve, reject) => {
        this.db.all(
          `UPDATE messages SET fecha_procesado = ? WHERE fecha_procesado IS NULL AND paciente_nombre NOT LIKE 'null' AND paciente_apellido NOT LIKE 'null' AND paciente_celular NOT LIKE 'null' AND medico_nombre NOT LIKE 'undefined' AND medico_apellido NOT LIKE 'undefined' AND turno_fecha LIKE ?;`,
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

  // Retrieve appointments between two dates
  async getAppointmentBetwenDate(
    dateStart: string,
    dateEnd: string
  ): Promise<Appointment[] | null> {
    const apointments: Appointment[] = [];
    console.log("Inside the repository");

    console.log(apointments);
    return apointments;
  }

  // Count the number of messages associated with an appointment
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
          console.log("Query successful:", row[0].count);
          resolve(row[0].count); // Resolve with the count of messages
        }
      );
    });
  }

  // Save a message to the database
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
        paciente_celular, 
        idTurno
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      this.db.run(query, [
        message.paciente_nombre,
        message.paciente_apellido,
        message.medico_nombre,
        message.medico_apellido,
        message.turno_fecha,
        message.turno_hora,
        message.paciente_celular,
        message.idTurno,
      ]);
    } catch (error) {
      return new Promise(() => false); // Return false in case of error
    }
    return new Promise(() => true); // Return true if the message is saved successfully
  }

  // Update a message's details, avoiding updates if patient data is unavailable
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
          message.paciente_celular,
          message.idTurno,
        ],
        function (err) {
          if (err) {
            console.error("Error during query:", err);
            return reject(err); // Reject the promise if there is an error
          }
          if (this.changes > 0) {
            console.log(`Successfully updated ${this.changes} record(s).`);
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

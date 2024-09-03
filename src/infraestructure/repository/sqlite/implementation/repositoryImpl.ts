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
    this.db = new sqlite3.Database("./database.db");
  }
  async getIdAppointment(phoneNumber: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      this.db.all(
        `SELECT idTurno FROM messages WHERE id_message=(SELECT id_message FROM messages WHERE paciente_celular = ? ORDER BY fecha_procesado DESC LIMIT 1)`,
        [`%${phoneNumber}%`],
        (err, rows: Message[]) => {
          if (err) {
            console.error("Error en la consulta:", err);
            reject(err); // Rechazar la promesa si hay un error
          } else {
            resolve(rows[0].idTurno);
          }
        }
      );
    });
  }
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
              console.error("Error en la consulta:", err);
              reject(err); // Rechazar la promesa si hay un error
            } else {
              resolve(rows);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error en la consulta:", error);
      return [];
    }
  }
  async getApointmentsByDate(date: string): Promise<Message[]> {
    try {
      return await new Promise((resolve, reject) => {
        this.db.all(
          `SELECT * FROM messages WHERE turno_fecha LIKE ?`,
          [`%${date}%`],
          (err, rows: Message[]) => {
            if (err) {
              console.error("Error en la consulta:", err);
              reject(err); // Rechazar la promesa si hay un error
            } else {
              resolve(rows);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error en la consulta:", error);
      return [];
    }
  }
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
            console.error("Error en la consulta:", err);
            reject(false); // Rechazar la promesa si hay un error
          } else {
            resolve(true);
          }
        }
      );
    });
  }
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
              console.error("Error en la consulta:", err);
              reject(false); // Rechazar la promesa si hay un error
            } else {
              resolve(true);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error en la consulta:", error);
      return false;
    }
  }
  async getAppointmentBetwenDate(
    dateStart: string,
    dateEnd: string
  ): Promise<Appointment[] | null> {
    const apointments: Appointment[] = [];
    //TODO: ver que la consulta devuelva una colección de objetos de un formato establecido
    console.log("EN EL REPOSITORIO");

    console.log(apointments);
    return apointments;
  }
  countAppointment(idAppointment: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT COUNT(*) AS count FROM messages WHERE idTurno = ?",
        [idAppointment],
        (err, row: any) => {
          if (err) {
            console.error("Error en la consulta:", err);
            return reject(err);
          }
          console.log("Consulta realizada con éxito:", row[0].count);
          resolve(row[0].count);
        }
      );
    });
  }
  async saveAppointments(message: Message): Promise<boolean> {
    const messageObject = {
      idTurno: message.idTurno,
      paciente_nombre: message.paciente_nombre,
      paciente_apellido: message.paciente_apellido,
      medico_nombre: message.medico_nombre,
      medico_apellido: message.medico_apellido,
      turno_fecha: message.turno_fecha,
      turno_hora: message.turno_hora,
      paciente_celular: message.paciente_celular,
      motivo: message.motivo,
      fecha_procesado: message.fecha_procesado ?? null,
      fecha_respuesta: message.fecha_respuesta ?? null,
      cancela_turno: message.cancela_turno ?? null,
    };
    console.log("messageObjects --->", messageObject);
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
    } catch (error) {}
    return new Promise(() => true);
  }
  updateAppointment(message: Message): Promise<boolean> {
    return new Promise((resolve, reject) => {
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
            console.error("Error en la consulta:", err);
            return reject(err); // Rechazar la promesa si hay un error
          }
          if (this.changes > 0) {
            console.log(
              `Se actualizó correctamente ${this.changes} registro(s).`
            );
            resolve(true); // Resolver la promesa si se actualizó al menos un registro
          } else {
            console.log(
              "No se encontró ningún registro con el idTurno especificado."
            );
            resolve(false); // Resolver la promesa aunque no se haya actualizado ningún registro
          }
        }
      );
    });
  }
}

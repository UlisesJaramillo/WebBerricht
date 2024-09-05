import sqlite3 from "sqlite3";

/**
 * Initializes the SQLite database and ensures the "messages" table is created.
 * @returns {Promise<sqlite3.Database>} - A promise that resolves to the SQLite database instance.
 */
export const initializeDB = async (): Promise<sqlite3.Database> => {
  return new Promise((resolve, reject) => {
    // Open the SQLite database
    const db = new sqlite3.Database("./database.db", (err) => {
      if (err) {
        console.error("Error opening the database:", err.message);
        reject(err); // Reject the promise if there's an error opening the database
      } else {
        console.log("Connected to the SQLite database.");

        // Create the 'messages' table if it doesn't already exist
        db.run(
          `
          CREATE TABLE IF NOT EXISTS messages (
            id_message INTEGER PRIMARY KEY AUTOINCREMENT,
            paciente_nombre TEXT,
            paciente_apellido TEXT,
            medico_nombre TEXT,
            medico_apellido TEXT,
            turno_fecha TEXT,
            turno_hora TEXT,
            paciente_celular TEXT,
            motivo TEXT,
            fecha_procesado TEXT,
            fecha_respuesta TEXT,
            cancela_turno TEXT,
            mensaje_paciente TEXT,
            idTurno TEXT
          );
        `,
          (err) => {
            if (err) {
              console.error(
                "Error creating or verifying the table:",
                err.message
              );
              reject(err); // Reject the promise if there's an error creating or verifying the table
            } else {
              console.log('Table "messages" created or verified successfully.');
              resolve(db); // Resolve the promise with the database instance
            }
          }
        );
      }
    });
  });
};

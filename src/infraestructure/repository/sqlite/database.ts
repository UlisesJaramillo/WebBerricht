import sqlite3 from "sqlite3";

export const initializeDB = async () => {
  const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
      console.error("Error al abrir la base de datos:", err.message);
    } else {
      console.log("Conectado a la base de datos SQLite.");
      // Crear la tabla si no existe
      db.run(
        `
        CREATE TABLE IF NOT EXISTS messages (
          id_message INTEGER PRIMARY KEY,
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
            console.error("Error al crear la tabla:", err.message);
          } else {
            console.log('Tabla "messages" creada o verificada correctamente.');
          }
        }
      );
    }
  });

  return db;
};

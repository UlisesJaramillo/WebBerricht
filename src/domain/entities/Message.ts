import { enviroments } from "../../../enviroments";

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

  // Helper method to format messages for sending
  public makeMessage() {
    const message =
      this.paciente_celular +
      "," +
      this.paciente_celular +
      "," +
      this.addTextFields(
        this.normalizeText(this.medico_nombre),
        this.normalizeText(this.medico_apellido),
        this.normalizeText(this.paciente_nombre),
        this.normalizeText(this.paciente_apellido),
        this.convertirFecha(this.turno_fecha),
        this.turno_hora
      ) +
      "\n";

    return message;
  }

  /**
   * Converts a date from YYYY-MM-DD format to DD-MM-YYYY format.
   * @param {string} date - The date in YYYY-MM-DD format.
   * @returns {string} - The date in DD-MM-YYYY format.
   */
  private convertirFecha(date: string) {
    // Split the date into year, month, and day parts
    const [year, month, day] = date.split("-");

    // Format the date into the new DD-MM-YYYY format
    return `${day}-${month}-${year}`;
  }

  // Helper method to replace placeholders in the message template with actual values
  private addTextFields = (
    medico_nombre: string,
    medico_apellido: string,
    paciente_nombre: string,
    paciente_apellido: string,
    turno_fecha: string,
    turno_hora: string
  ) => {
    return enviroments.MSJ.replace("<medico_nombre>", medico_nombre)
      .replace("<medico_apellido>", medico_apellido)
      .replace("<paciente_nombre>", paciente_nombre)
      .replace("<paciente_apellido>", paciente_apellido)
      .replace("<turno_fecha>", turno_fecha)
      .replace("<turno_hora>", turno_hora);
  };

  // Helper method to normalize text by replacing accented characters and special symbols
  private normalizeText(text: string) {
    const accentsMap = new Map([
      ["á", "a"],
      ["é", "e"],
      ["í", "i"],
      ["ó", "o"],
      ["ú", "u"],
      ["Á", "A"],
      ["É", "E"],
      ["Í", "I"],
      ["Ó", "O"],
      ["Ú", "U"],
      ["ñ", "n"],
      ["Ñ", "N"],
      // Add more if needed
    ]);

    const specialCharsMap = new Map([
      ["@", "arroba"],
      ["#", "num"],
      ["$", "$"],
      ["%", "porcentaje"],
      ["&", "Y"],
      ["*", "asterisco"],
      // Add more if needed
    ]);

    let normalizedText = text;

    // Replace accented characters with their non-accented counterparts
    accentsMap.forEach((value, key) => {
      const regex = new RegExp(key, "g");
      normalizedText = normalizedText.replace(regex, value);
    });

    // Replace special characters with their textual representation
    specialCharsMap.forEach((value, key) => {
      const regex = new RegExp(`\\${key}`, "g"); // Escape special characters
      normalizedText = normalizedText.replace(regex, value);
    });

    return normalizedText;
  }
}

import { enviroments } from "../../../../enviroments";
import { MessageIA } from "../../../domain/interfaces/MessagesIA";
import { OpenAI } from "openai";

//IMPLEMENTACIÖN DE IA (CHAT GPT) para procesar las respuestas
export class IAImpl implements MessageIA {
  private openai: OpenAI = new OpenAI({
    apiKey: enviroments.OPENAI_API_KEY, // Asegúrate de configurar tu clave de API
  });
  constructor() {}

  /**
   * Evalúa una respuesta de paciente y la clasifica como 'SI', 'NO', o 'INDEFINIDO'.
   * @param {string} message - Mensaje del paciente a evaluar.
   * @returns {Promise<string>} - La clasificación de la respuesta: 'SI', 'NO', o 'INDEFINIDO'.
   */
  async analizeMessage(message: string): Promise<string> {
    const prompt = `
    Clasifica la siguiente respuesta del paciente como "SI", "NO", o "INDEFINIDO". Si no puedes determinar una respuesta clara, responde "INDEFINIDO":
    
    Mensaje del paciente: "${message}"
    
    Clasificación:`;
    try {
      const response = await this.openai.completions.create({
        model: "gpt-3.5-turbo-0125", // O el modelo que prefieras
        prompt: prompt,
        max_tokens: 100,
        temperature: 0,
      });

      const classification = response.choices[0].text.trim().toUpperCase();

      // Validar y retornar la clasificación
      if (["YES", "NO", "UNDETERMINED"].includes(classification)) {
        return classification;
      } else {
        console.error("Clasificación no válida:", classification);
        return "INDEFINIDO";
      }
    } catch (error) {
      console.error("Error al clasificar la respuesta del paciente:", error);
      return "INDEFINIDO";
    }
  }
}

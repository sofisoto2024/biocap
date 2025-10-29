import { GoogleGenAI, Modality } from "@google/genai";
import type { TrainingRecord } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const placeholderImage = 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=800&auto=format&fit=crop';

export const geminiService = {
  digitizeImage: async (base64Image: string, mimeType: string): Promise<string> => {
    try {
      const filePart = {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      };
      const textPart = {
        text: 'Eres un experto en digitalización de documentos. Extrae todo el texto de este documento (imagen o PDF) de la página de un manual de equipo médico. Mantén la estructura original, los encabezados y las listas con la mayor precisión posible utilizando el formato Markdown.'
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [filePart, textPart] },
      });
      
      return response.text;
    } catch (error) {
      console.error("Error digitizing image:", error);
      return "Error: No se pudo procesar el documento. Por favor, inténtalo de nuevo.";
    }
  },

  generateTrainingContent: async (topic: string): Promise<string> => {
    try {
      const prompt = `Genera una cápsula de capacitación concisa para personal médico sobre el tema: "${topic}". El contenido debe ser claro, profesional y fácil de entender. Estructúralo con Markdown. Incluye las siguientes secciones: 1. **Objetivo**: Una breve declaración sobre la meta de la capacitación. 2. **Pasos Operativos Clave**: Una lista numerada de los pasos esenciales para usar el equipo. 3. **Precauciones de Seguridad**: Una lista con viñetas de advertencias de seguridad críticas. 4. **Verificación de Comprensión**: Una pregunta de opción múltiple con cuatro opciones (A, B, C, D) para evaluar la comprensión, e indica la respuesta correcta.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Error generating training content:", error);
      return "Error: No se pudo generar el contenido. Por favor, inténtalo de nuevo.";
    }
  },
  
  generateTrainingImage: async (topic: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `Fotografía de producto, ultra realista y detallada de un "${topic}" sobre un fondo neutro y limpio en un entorno de laboratorio u hospital. La iluminación debe ser brillante y profesional, destacando las texturas y detalles del equipo médico.` }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstCandidate = response.candidates?.[0];
        if (firstCandidate?.content?.parts) {
            for (const part of firstCandidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:image/png;base64,${base64ImageBytes}`;
                }
            }
        }
        
        console.warn('La generación de la imagen falló o no devolvió candidatos para el tema:', topic);
        return placeholderImage; // Fallback if no image is generated
    } catch (error) {
        console.error("Error generating training image:", error);
        return placeholderImage; // Fallback on error
    }
  },

  getDashboardInsights: async (records: TrainingRecord[]): Promise<string> => {
    try {
      const dataString = JSON.stringify(records, null, 2);
      const prompt = `Como analista experto en capacitación para un hospital, analiza los siguientes datos de finalización de capacitaciones. Proporciona tres ideas accionables para mejorar el programa de capacitación. Concéntrate en identificar los departamentos que están destacando o quedándose atrás, y sugiere los siguientes pasos específicos y prácticos. Presenta tus ideas como una lista con viñetas.

Datos:
${dataString}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Error getting dashboard insights:", error);
      return "Error: No se pudieron generar los análisis. Por favor, inténtalo de nuevo.";
    }
  }
};
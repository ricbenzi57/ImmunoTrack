
import { GoogleGenAI } from "@google/genai";
import { Patient, Visit, Message, Attachment } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzePatientHistory = async (patient: Patient, visits: Visit[]) => {
  const ai = getAIClient();
  if (!ai) return "Errore: API Key mancante.";

  const prompt = `
    Sei un assistente medico esperto in immunologia clinica. 
    Analizza i dati del paziente:
    - Nome: ${patient.firstName} ${patient.lastName}
    - Diagnosi di Accesso: ${patient.accessDiagnosis}
    
    Storico Visite (JSON): ${JSON.stringify(visits)}
    
    Compito:
    1. Fornisci un riassunto clinico dell'evoluzione del paziente.
    2. Identifica trend significativi nei parametri immunologici (IgG, IgA, IgM, C3, C4, PCR) se presenti.
    3. Segnala eventuali anomalie o necessità di aggiustamento terapeutico basandoti sulle note del dottore.
    4. Sii professionale, conciso e strutturato.
    
    Rispondi in Italiano.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Errore durante l'analisi AI. Verifica la connessione o l'API Key.";
  }
};

export const generateResponse = async (history: Message[], prompt: string, attachments: Attachment[] = []) => {
  const ai = getAIClient();
  if (!ai) throw new Error("API Key mancante.");

  const systemMessage = history.find(m => m.role === 'system');
  
  const chatHistory = history
    .filter(m => m.role !== 'system' && !m.error)
    .map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemMessage?.text || "Sei un assistente medico esperto."
    },
    history: chatHistory
  });

  const parts: any[] = [{ text: prompt }];
  attachments.forEach(a => {
    parts.push({
      inlineData: {
        mimeType: a.mimeType,
        data: a.base64
      }
    });
  });

  const response = await chat.sendMessage({ message: parts });
  return response.text;
};

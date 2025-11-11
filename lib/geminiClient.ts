import { GoogleGenAI } from "@google/genai";

// The API key must be obtained from process.env.API_KEY as per guidelines.
const apiKey = process.env.API_KEY;

// Initialize the GoogleGenAI client. It will be null if no API key is found
// to maintain graceful degradation of AI features as in the original code.
export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
    console.warn("Gemini API key not found. AI features will be disabled.");
}

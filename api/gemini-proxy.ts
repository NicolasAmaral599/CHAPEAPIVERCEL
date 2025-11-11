import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured on server.' });
    }

    // Handle a simple ping to check if the API key is available without making a full request to Gemini
    if (req.body.ping) {
        return res.status(200).json({ status: 'ok' });
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        
        // The request body from the client will contain the parameters for generateContent
        const params = req.body; 
        
        const response = await ai.models.generateContent(params);
        
        // The client needs the text and any function calls.
        const responseData = {
          text: response.text,
          functionCalls: response.functionCalls,
          // We also need the raw parts for history reconstruction if a function call occurs
          parts: response.candidates?.[0]?.content?.parts || [],
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error("Error in Gemini proxy:", error);
        // It's helpful to forward the error message for debugging
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while calling the Gemini API.';
        return res.status(500).json({ error: errorMessage });
    }
}

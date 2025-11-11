import { ai } from '../lib/geminiClient';

const prompts = {
    pt: (clientName: string, amount: number, service: string) => `Gere uma breve observação profissional para uma nota fiscal em português. Cliente: "${clientName}", Valor: R$ ${amount.toFixed(2)}, Serviço: "${service}". A observação deve ser concisa e formal.`,
    en: (clientName: string, amount: number, service: string) => `Generate a brief, professional observation for an invoice in English. Client: "${clientName}", Amount: $${amount.toFixed(2)}, Service: "${service}". The observation should be concise and formal.`
};

export const generateInvoiceObservation = async (clientName: string, amount: number, service: string, lang: 'pt' | 'en'): Promise<string> => {
    // Check if the AI client was initialized before using it
    if (!ai) {
        return lang === 'pt' ? "Serviço de IA indisponível. Por favor, configure a chave de API." : "AI Service unavailable. Please configure the API key.";
    }

    const prompt = prompts[lang](clientName, amount, service);

    try {
        // FIX: Simplified the `contents` parameter for a single text prompt.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 100,
                thinkingConfig: { thinkingBudget: 0 } // Disable for low latency
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating observation with Gemini API:", error);
        return lang === 'pt' ? "Erro ao gerar observação. Tente novamente." : "Error generating observation. Please try again.";
    }
};

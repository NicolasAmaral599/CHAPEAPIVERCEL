
const prompts = {
    pt: (clientName: string, amount: number, service: string) => `Gere uma breve observação profissional para uma nota fiscal em português. Cliente: "${clientName}", Valor: R$ ${amount.toFixed(2)}, Serviço: "${service}". A observação deve ser concisa e formal.`,
    en: (clientName: string, amount: number, service: string) => `Generate a brief, professional observation for an invoice in English. Client: "${clientName}", Amount: $${amount.toFixed(2)}, Service: "${service}". The observation should be concise and formal.`
};

export const generateInvoiceObservation = async (clientName: string, amount: number, service: string, lang: 'pt' | 'en'): Promise<string> => {
    const prompt = prompts[lang](clientName, amount, service);

    try {
        const apiResponse = await fetch('/api/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.5,
                    topP: 0.95,
                    topK: 64,
                    maxOutputTokens: 100,
                    thinkingConfig: { thinkingBudget: 0 } // Disable for low latency
                }
            })
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(errorData.error || `API request failed with status ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        return data.text.trim();
    } catch (error) {
        console.error("Error generating observation via proxy:", error);
        return lang === 'pt' ? "Erro ao gerar observação. Tente novamente." : "Error generating observation. Please try again.";
    }
};

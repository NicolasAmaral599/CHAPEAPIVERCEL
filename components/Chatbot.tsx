import React, { useState, useRef, useEffect } from 'react';
import { FunctionDeclaration, Type, Part, Content } from "@google/genai";
import { useTranslations } from '../context/LanguageContext';
import { Invoice, InvoiceStatus, Message } from '../types';

interface ChatbotProps {
  invoices: Invoice[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
}

const tools: { functionDeclarations: FunctionDeclaration[] }[] = [
  {
    functionDeclarations: [
      {
        name: 'createInvoice',
        description: 'Cria uma nova nota fiscal. A data de emissão é sempre hoje.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            clientName: { type: Type.STRING, description: 'O nome do cliente.' },
            amount: { type: Type.NUMBER, description: 'O valor total da nota fiscal.' },
            dueDate: { type: Type.STRING, description: 'A data de vencimento da nota no formato AAAA-MM-DD.' },
            observations: { type: Type.STRING, description: 'Notas ou observações opcionais para a nota fiscal.' },
          },
          required: ['clientName', 'amount', 'dueDate'],
        },
      },
      {
        name: 'getInvoiceDetails',
        description: "Recupera os detalhes completos de uma nota fiscal específica usando seu ID.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'O ID da nota fiscal a ser recuperada, por exemplo "d290f1ee-6c54-4b01-90e6-d701748f0851".' },
          },
          required: ['id'],
        },
      },
      {
        name: 'updateInvoice',
        description: 'Atualiza um ou mais campos de uma nota fiscal existente, identificada por seu ID.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'O ID da nota fiscal a ser atualizada.' },
            clientName: { type: Type.STRING, description: 'O novo nome do cliente.' },
            amount: { type: Type.NUMBER, description: 'O novo valor total da nota.' },
            dueDate: { type: Type.STRING, description: 'A nova data de vencimento no formato AAAA-MM-DD.' },
            status: { type: Type.STRING, description: 'O novo status da nota.', enum: Object.values(InvoiceStatus) },
            observations: { type: Type.STRING, description: 'As novas notas ou observações para a nota.' },
          },
          required: ['id'],
        },
      },
      {
        name: 'listInvoices',
        description: 'Lista as notas fiscais, com a opção de filtrar por status (Pago, Pendente, Vencido).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: 'O status para filtrar as notas.', enum: Object.values(InvoiceStatus) },
          },
        },
      },
      {
        name: 'deleteInvoice',
        description: 'Exclui permanentemente uma nota fiscal do sistema usando seu ID. Requer confirmação prévia do usuário.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'O ID da nota fiscal a ser excluída.' },
          },
          required: ['id'],
        },
      },
    ],
  },
];

const Chatbot: React.FC<ChatbotProps> = ({ invoices, messages, setMessages, addInvoice, updateInvoice, deleteInvoice }) => {
  const { t } = useTranslations();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the API key is configured on the server via the proxy
    const checkApiConfig = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/gemini-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ping: true }) // Send a dummy request
            });
            if (res.status === 500) {
                 const data = await res.json();
                 if (data.error?.includes('API key not configured')) {
                    setError(t('chatbot.apiKeyMissing'));
                    setMessages([{ role: 'model', text: t('chatbot.apiKeyMissing') }]);
                    return;
                }
            }
             setError(null);
             if (messages.length === 0) {
                setMessages([{ role: 'model', text: t('chatbot.welcomeMessage') }]);
             }
        } catch (e) {
            console.error("Failed to check API config:", e);
            const errorMessage = t('chatbot.errorMessage');
            setError(errorMessage);
            setMessages([{ role: 'model', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Only run check if messages are empty to avoid re-running on new chat.
    if (messages.length === 0) {
        checkApiConfig();
    }
  }, [messages.length, setMessages, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeFunctionCall = async (name: string, args: any): Promise<any> => {
    switch (name) {
      case 'createInvoice': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [year, month, day] = (args.dueDate as string).split('-').map(Number);
        const dueDateObj = new Date(year, month - 1, day);
        const newInvoiceData: Omit<Invoice, 'id'> = {
          clientName: args.clientName,
          amount: args.amount,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: args.dueDate,
          status: dueDateObj < today ? InvoiceStatus.Vencido : InvoiceStatus.Pendente,
          observations: args.observations || '',
        };
        await addInvoice(newInvoiceData);
        return { success: true, clientName: args.clientName, amount: args.amount };
      }
      case 'getInvoiceDetails': {
        const invoice = invoices.find(inv => inv.id.toLowerCase() === args.id.toLowerCase());
        return invoice ? { ...invoice } : { error: `Nota fiscal com ID ${args.id} não encontrada.` };
      }
      case 'updateInvoice': {
        const originalInvoice = invoices.find(inv => inv.id.toLowerCase() === args.id.toLowerCase());
        if (!originalInvoice) return { error: `Nota fiscal com ID ${args.id} não encontrada.` };
        const updatedInvoice = { ...originalInvoice, ...args };
        await updateInvoice(updatedInvoice);
        return { success: true, id: args.id };
      }
      case 'deleteInvoice': {
        const invoiceExists = invoices.some(inv => inv.id.toLowerCase() === args.id.toLowerCase());
        if (!invoiceExists) return { error: `Nota fiscal com ID ${args.id} não encontrada.` };
        await deleteInvoice(args.id);
        return { success: true, id: args.id };
      }
      case 'listInvoices': {
        let results = invoices;
        if (args.status) {
          results = invoices.filter(inv => inv.status === args.status);
        }
        if (results.length > 0) {
            // Return a summary to avoid overwhelming the context window
            return results.map(inv => ({ id: inv.id, clientName: inv.clientName, amount: inv.amount, status: inv.status, dueDate: inv.dueDate }));
        }
        return { message: `Nenhuma nota fiscal encontrada com o status '${args.status || 'qualquer'}'.` };
      }
      default:
        return { error: `Função desconhecida: ${name}` };
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || error) return;

    const userMessage: Message = { role: 'user', text: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    // Convert message history to Gemini's format
    let geminiHistory: Content[] = currentMessages
        .filter(msg => msg.text !== t('chatbot.welcomeMessage') && msg.text !== t('chatbot.apiKeyMissing')) // Filter out initial messages
        .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

    try {
        const today = new Date().toISOString().split('T')[0];
        const invoiceListForContext = invoices.length > 0 
            ? invoices.map(inv => `- ID: ${inv.id}, Cliente: ${inv.clientName}, Valor: R$ ${inv.amount.toFixed(2)}, Status: ${t(`common.status.${inv.status}`)}`).join('\n')
            : 'Nenhuma nota fiscal cadastrada no momento.';

        const systemInstruction = `Você é um assistente de IA para um aplicativo de gerenciamento de notas fiscais chamado NotaFácil.
Seu objetivo é ajudar os usuários a gerenciar suas notas: criar, visualizar detalhes, atualizar, listar e excluir.
A data de hoje é ${today}.

**Contexto Atual das Notas Fiscais:**
${invoiceListForContext}

**Instruções de Operação:**
- Para visualizar, atualizar ou excluir uma nota, use o ID correspondente da lista acima. Se o usuário não fornecer um ID, use o nome do cliente ou outros detalhes para encontrá-lo na lista.
- Para ações destrutivas (excluir), SEMPRE peça confirmação ao usuário antes de chamar a função 'deleteInvoice'. Exemplo: "Você tem certeza que deseja excluir a nota X?". Se o usuário confirmar, chame a função.
- Após executar uma função com sucesso, confirme a ação para o usuário de forma clara (ex: "Nota fiscal para [Cliente] criada com sucesso."). Se uma função retornar um erro, informe o usuário sobre o erro de forma clara.
- A data de emissão de novas notas é sempre hoje (${today}).
- Responda sempre em português.`;

        const callProxy = async (contents: Content[]) => {
            const apiResponse = await fetch('/api/gemini-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gemini-2.5-flash',
                    contents: contents,
                    config: { systemInstruction },
                    tools: tools
                })
            });
            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData.error || `API Error: ${apiResponse.statusText}`);
            }
            return apiResponse.json();
        };

        let geminiResponse = await callProxy(geminiHistory);

        if (geminiResponse.functionCalls && geminiResponse.functionCalls.length > 0) {
             geminiHistory.push({
                role: 'model',
                parts: geminiResponse.parts
             });
            
            const functionResponses: Part[] = [];
            for (const fc of geminiResponse.functionCalls) {
                try {
                    const result = await executeFunctionCall(fc.name, fc.args);
                    functionResponses.push({
                        functionResponse: {
                            name: fc.name,
                            response: { result }
                        }
                    });
                } catch (err) {
                     console.error(`Error executing function ${fc.name}:`, err);
                     const errorMessage = err instanceof Error ? err.message : `Falha ao executar a função ${fc.name}.`;
                     functionResponses.push({
                         functionResponse: {
                             name: fc.name,
                             response: { error: errorMessage }
                         }
                     });
                }
            }

            geminiHistory.push({
                role: 'user', 
                parts: functionResponses
            });

            geminiResponse = await callProxy(geminiHistory);
        }
        
        if (geminiResponse.text) {
            setMessages(prev => [...prev, { role: 'model', text: geminiResponse.text }]);
        }

    } catch (err) {
        console.error("Chatbot error:", err);
        const errorMessage = err instanceof Error ? err.message : t('chatbot.errorMessage');
        setError(errorMessage);
        setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
            <div className="flex justify-start">
                 <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-700">
                    <div className="flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && !error.includes('API') && <p className="px-4 text-sm text-red-500">{error}</p>}
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatbot.inputPlaceholder')}
            disabled={isLoading || !!error}
            className="flex-1 w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" disabled={isLoading || !input.trim() || !!error} className="bg-indigo-600 text-white rounded-full p-2.5 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path transform="translate(2, -2) rotate(45, 10, 10)" d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 16.51l.906.259 1.956 5.585a1 1 0 001.788 0l7-14a1 1 0 00-1.169-1.409l-5 1.428A1 1 0 0011 3.49l-.906-.259L8.138 7.646a1 1 0 00-.545-.545L1.956 5.145a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 003 16.51l.906.259 1.956 5.585a1 1 0 001.788 0l7-14a1 1 0 00-1.169-1.409l-5 1.428A1 1 0 0011 3.49l-.906-.259L8.138 7.646a1 1 0 00-.545-.545L1.956 5.145z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
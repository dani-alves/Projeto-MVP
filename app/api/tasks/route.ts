import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

let tasks: any[] = [];

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            return NextResponse.json({ error: "API Key não configurada no .env.local" }, { status: 500 });
        }

        const { title, description } = await req.json();
        const prompt = `Atue como assistente de priorização. Analise a tarefa: Título: ${title}, Descrição: ${description}. 
    Retorne EXCLUSIVAMENTE um JSON puro: {"urgencia": N, "impacto": N, "justificativa": "string"}. 
    N de 1 a 10. Justificativa max 20 palavras.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();
        const data = JSON.parse(text);

        const newTask = {
            id: Date.now(),
            title,
            description,
            ...data,
            score: (Number(data.urgencia) + Number(data.impacto)) / 2
        };

        tasks.push(newTask);
        return NextResponse.json(tasks.sort((a, b) => b.score - a.score));
    } catch (error: any) {
        console.error("Gemini Error Details:", JSON.stringify(error, null, 2));

        let message = "Erro inesperado ao processar tarefa";
        if (error.status === 429) {
            message = "Limite de requisições excedido (Quota). Aguarde 60 segundos e tente novamente.";
        } else if (error.status === 404) {
            message = "Modelo não encontrado (404). O modelo selecionado não está disponível no plano gratuito da sua conta ou região.";
        } else if (error.message) {
            message = `Erro Gemini: ${error.message}`;
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json(tasks.sort((a, b) => b.score - a.score));
}

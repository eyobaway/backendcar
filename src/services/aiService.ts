import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface PropertyContext {
    id: string;
    price: number | string;
    make: string;
    model: string;
    year: number;
    transmission: string;
    fuelType: string;
    mileage: number;
    description: string;
}

export class AIService {
    private model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    async getPropertyRecommendations(userQuery: string, properties: PropertyContext[], contextProperty?: any) {
        let prompt = `
            You are a professional automotive sales assistant for "PTGR CARS".
            Your goal is to help users find their perfect vehicle from the provided fleet list.
            
            Available Vehicles:
            ${JSON.stringify(properties, null, 2)}
            `;

        if (contextProperty) {
            prompt += `
            CRITICAL CONTEXT: The user is currently viewing, or has tagged, the following vehicle:
            ${JSON.stringify(contextProperty, null, 2)}
            Please tailor your answer with this vehicle in mind if relevant.
            `;
        }

        prompt += `
            User's Request: "${userQuery}"
            
            Instructions:
            1. Analyze the user's request.
            2. Match it against the available vehicles (filter by make, model, year, transmission, etc.).
            3. Provide a friendly, helpful response in natural language.
            4. If you find matching vehicles, mention them and explain why they fit.
            5. Return your response in a clear format. 
            6. At the end of your response, if there are specific vehicle matches, include a section called "MATCHED_IDS:" followed by a comma-separated list of the vehicle IDs. Example: "MATCHED_IDS: 1, 5, 12". This is for the frontend to highlight them.
            7. If no vehicles match, suggest the most similar ones or ask for more details.
            
            Be concise and professional.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error: any) {
            console.error("Gemini AI Error:", error);
            throw new Error("Failed to get AI recommendations");
        }
    }

    async generateMessageDraft(type: string, propertyContext?: any, lastMessages?: any[]) {
        const prompt = `
            You are an AI Automotive Assistant helping a CLIENT (buyer/renter) draft a message to a car dealer.
            Your task is to draft a professional, concise message on behalf of the CLIENT.
            
            Draft Type: ${type} (e.g., inquiry, professional_response, follow_up)
            
            Context:
            - Vehicle Details: ${propertyContext ? JSON.stringify(propertyContext) : "None"}
            - Recent Conversation: ${lastMessages ? JSON.stringify(lastMessages) : "None"}
            
            Instructions:
            - Assume the persona of a prospective buyer or renter interested in the vehicle.
            - DO NOT act as a car dealer (e.g., do NOT say "Thank you for your interest" or "How can I help you").
            - If type is "inquiry", draft a professional first message asking the dealer for a test drive or asking for more details about the vehicle's history/condition.
            - If type is "professional_response", draft a polite reply from the client to the dealer based on the recent conversation.
            - If type is "follow_up", draft a brief message from the client checking on the status of a financing offer, scheduling, or previous inquiry.
            - Keep the tone polite, interested, and direct.
            - Do not include any placeholders like "[Name]" or signatures. Only include the message body.
            - Provide ONLY the message text without quotes.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error("Gemini AI Drafting Error:", error);
            throw new Error("Failed to generate message draft");
        }
    }

    async generateAutocomplete(currentText: string, propertyContext?: any, lastMessages?: any[]) {
        const prompt = `
            You are an AI embedded in a chat input field. The user is typing a message in a car marketplace app.
            Your task is to autocomplete their message. Provide ONLY the next few words that logically continue their sentence.
            Do NOT finish the sentence if it doesn't make sense, just provide a short, natural continuation (1-7 words).
            If no continuation makes sense or if the user finished a thought, return an empty string.
            CRITICAL: Do NEVER repeat the text the user already typed. Provide ONLY the new continuation text. Do not include quotes.
            
            Context:
            - Vehicle Details: ${propertyContext ? JSON.stringify(propertyContext) : "None"}
            - Recent Conversation: ${lastMessages ? JSON.stringify(lastMessages) : "None"}
            
            Current Text typed by user: "${currentText}"
            
            Suggested continuation:
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().replace(/^\\s+/, ''); // only trim start so trailing spaces aren't added if AI includes them
            // Remove common unwanted prefixes
            if (text.startsWith('"') && text.endsWith('"')) {
                text = text.substring(1, text.length - 1);
            }
            return text;
        } catch (error: any) {
            console.error("Gemini AI Autocomplete Error:", error);
            return ""; // Soft fail
        }
    }

    async generatePropertyDescription(details: any) {
        const prompt = `
            You are a professional automotive copywriter.
            Write a compelling, professional, and engaging vehicle description for the following car:
            
            Title: ${details.title || "Luxury Vehicle"}
            Make: ${details.make}
            Model: ${details.model}
            Year: ${details.year}
            Price: $${details.price}
            Transmission: ${details.transmission}
            Fuel Type: ${details.fuelType}
            Mileage: ${details.mileage} km
            Condition: ${details.condition}
            
            Instructions:
            - Focus on the vehicle's performance, comfort, and unique selling points.
            - Use professional and sensory language.
            - Keep it between 100 and 150 words.
            - Do not include placeholders or generic phrases like "Contact us for more info".
            - Provide ONLY the description text without any titles or quotes.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error("Gemini AI Description Generation Error:", error);
            throw new Error("Failed to generate property description");
        }
    }

    async generateAdminPerformanceSummary(stats: any) {
        const prompt = `
            You are an AI Business Analyst for an Automotive Marketplace Platform called "PTGR CARS".
            Your task is to provide a high-level, professional, and insightful summary of the platform's performance for the Admin Dashboard.
            
            Platform Statistics:
            ${JSON.stringify(stats, null, 2)}
            
            Instructions:
            1. Analyze the growth trends (users, dealers, vehicles) from the provided growthData.
            2. Comment on the current inventory mix and top markets.
            3. Highlight any significant milestones or areas of growth (e.g., "30% increase in dealership registrations this month").
            4. Provide actionable insights or observations based on the data.
            5. Keep the tone professional, encouraging, and data-driven.
            6. Limit the response to about 150-200 words.
            7. Use markdown formatting for readability (e.g., bolding key metrics).
            8. Do not use generic filler language. Be specific to the data provided.
            
            Provide only the summary text.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error("Gemini AI Admin Summary Error:", error);
            throw new Error("Failed to generate admin summary");
        }
    }

    async getAdminChatResponse(stats: any, message: string, history: any[] = []) {
        const prompt = `
            You are the "PTGR Fleet Analyst", an expert advisor for automotive marketplace administrators.
            You are currently chatting with an Admin on their dashboard.
            
            ADMIN DASHBOARD CONTEXT (Current Stats):
            ${JSON.stringify(stats, null, 2)}
            
            CONVERSATION HISTORY:
            ${JSON.stringify(history, null, 2)}
            
            ADMIN'S QUESTION: "${message}"
            
            Instructions:
            1. Answer the question specifically using the provided platform statistics (inventory, dealers, users).
            2. If the data to answer the question is not present in the stats, politely say so and provide general automotive business advice or suggest what data would be needed.
            3. Keep the tone professional, concise, and helpful.
            4. Use markdown formatting to highlight numbers or key insights.
            5. If asked to "regenerate" or "summarize again", provide a different angle or deeper dive into a specific part of the data.
            6. Provide ONLY the text response.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error("Gemini AI Admin Chat Error:", error);
            throw new Error("Failed to generate AI response for admin");
        }
    }

    async generateAgentPerformanceSummary(stats: any) {
        const prompt = `
            You are the "PTGR Dealer Coach", an expert advisor for car dealers.
            Your task is to provide a brief, encouraging, and insightful summary of a dealer's vehicle fleet performance based on their data.
            
            DEALER PERFORMANCE DATA:
            ${JSON.stringify(stats, null, 2)}
            
            Instructions:
            1. Analyze their fleet performance (how many saves/favorites their vehicles are getting).
            2. Comment on their engagement trends (views vs inquiries).
            3. Mention their inventory mix (New vs Used, Sale vs Rent).
            4. Provide 1-2 actionable tips to improve their sales performance (e.g., "Add more photos to your least saved vehicle").
            5. Keep the tone professional, upbeat, and concise (Limit to 120-150 words).
            6. Use markdown for readability.
            
            Provide only the summary text.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error("Gemini AI Agent Summary Error:", error);
            throw new Error("Failed to generate agent summary");
        }
    }

    async getAgentChatResponse(stats: any, message: string, history: any[] = []) {
        const prompt = `
            You are the "PTGR Dealer Coach", assisting a dealer with their vehicle fleet.
            
            DEALER DATA CONTEXT:
            ${JSON.stringify(stats, null, 2)}
            
            CONVERSATION HISTORY:
            ${JSON.stringify(history, null, 2)}
            
            AGENT'S QUESTION: "${message}"
            
            Instructions:
            1. Answer specifically using the dealer's vehicle data and engagement stats.
            2. Provide practical, high-value automotive sales advice.
            3. Keep the tone professional and encouraging.
            4. If they ask about common automotive topics (e.g. "How to price a used SUV?"), give them a data-driven answer based on their current average price ${stats.summary?.avgPrice || 'N/A'}.
            5. Provide ONLY the text response.
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.error("Gemini AI Agent Chat Error:", error);
            throw new Error("Failed to generate AI response for agent");
        }
    }
}

export default new AIService();

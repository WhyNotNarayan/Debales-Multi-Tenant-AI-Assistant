import OpenAI from "openai";
import { Integration } from "@/models/Integration";
import connectToDatabase from "./mongodb";

export async function generateAIResponse(projectId: string, prompt: string, history: any[]) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in environment variables");
  }
  
  // Use OpenAI SDK but point it to Groq's super-fast free servers
  const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  await connectToDatabase();
  
  // Check integrations
  const integration = await Integration.findOne({ projectId });
  
  // Logic to detect if the prompt is asking for Shopify/CRM data
  const isShopifyQuery = prompt.toLowerCase().includes('shopify') || 
                        prompt.toLowerCase().includes('order') || 
                        prompt.toLowerCase().includes('sales');
                        
  const isCRMQuery = prompt.toLowerCase().includes('crm') || 
                    prompt.toLowerCase().includes('customer') || 
                    prompt.toLowerCase().includes('lead');

  let contextMsg = "You are Debales AI, a proactive enterprise assistant. Your goal is to help users manage their business data effectively.";
  contextMsg += "\nFORMATTING RULES:";
  contextMsg += "\n- Use emojis (📊, 🛒, 👥).";
  contextMsg += "\n- Use BOLD (**Text**) for key data.";
  contextMsg += "\n- Use bullet points (*) for lists.";
  contextMsg += "\n- Use section headers (### HEADER).";
  contextMsg += "\n- Use double newlines between paragraphs for clear spacing.";
  contextMsg += "\nIf the user asks 'what can you do?', mention the specific integrations that are ACTIVE for them.";
  
  if (integration?.shopifyEnabled) {
    contextMsg += "\n- Shopify Integration is ACTIVE. You can help with orders, sales, and revenue data.";
    if (isShopifyQuery) {
      contextMsg += "\n[MOCK DATA: Total Orders: 1,240, Revenue: $45,200, Top Product: AI Assistant Pro. Monthly Growth: +12%]";
    }
  } else if (isShopifyQuery) {
    return "The Shopify integration is currently disabled for your project. Please ask your Admin to enable it if you need to access order or sales data.";
  }

  if (integration?.crmEnabled) {
    contextMsg += "\n- CRM Integration is ACTIVE. You can help with customer lists, lead status, and pipeline value.";
    if (isCRMQuery) {
      contextMsg += "\n[MOCK DATA: Total Customers: 850, Active Leads: 120, Pipeline Value: $1.2M, Conversion Rate: 15%]";
    }
  } else if (isCRMQuery) {
    return "The CRM integration is currently disabled for your project. Please ask your Admin to enable it to access customer or lead information.";
  }

  // Map history to OpenAI format
  const messages: any[] = [
    { role: "system", content: contextMsg }
  ];

  if (history && history.length > 0) {
    history.forEach((m) => {
      // OpenAI uses 'assistant' instead of 'model'
      const role = m.role === 'model' ? 'assistant' : 'user';
      messages.push({ role, content: m.content });
    });
  }

  messages.push({ role: "user", content: prompt });

  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant", // Groq's fast Llama 3.1 model
      messages: messages,
    });
    
    return response.choices[0].message.content || "";
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown Groq error';
    console.error("GROQ API ERROR:", message);
    throw new Error(`${message}`); // Only throw the clean message
  }
}export async function generateAIStream(projectId: string, prompt: string, history: any[]) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing in environment variables");
  }
  
  const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  await connectToDatabase();
  const integration = await Integration.findOne({ projectId });
  
  const isShopifyQuery = prompt.toLowerCase().includes('shopify') || 
                        prompt.toLowerCase().includes('order') || 
                        prompt.toLowerCase().includes('sales');
                        
  const isCRMQuery = prompt.toLowerCase().includes('crm') || 
                    prompt.toLowerCase().includes('customer') || 
                    prompt.toLowerCase().includes('lead');

  let contextMsg = "You are Debales AI, a proactive enterprise assistant. Your goal is to help users manage their business data effectively.";
  contextMsg += "\nFORMATTING RULES:";
  contextMsg += "\n- Use emojis to make the chat feel friendly and professional (e.g. 📊, 🛒, 👥).";
  contextMsg += "\n- Use BOLD (e.g. **Text**) for important numbers or names.";
  contextMsg += "\n- Use bullet points (*) for lists.";
  contextMsg += "\n- Use clear sections with titles (e.g. ### SALES SUMMARY).";
  contextMsg += "\n- Use double newlines between paragraphs for clear spacing.";
  contextMsg += "\nIf the user asks 'what can you do?', mention the specific integrations that are ACTIVE for them.";
  
  if (integration?.shopifyEnabled) {
    contextMsg += "\n- Shopify Integration is ACTIVE. You can help with orders, sales, and revenue data.";
    if (isShopifyQuery) {
      contextMsg += "\n[MOCK DATA: Total Orders: 1,240, Revenue: $45,200, Top Product: AI Assistant Pro. Monthly Growth: +12%]";
    }
  } else if (isShopifyQuery) {
    return "The Shopify integration is currently disabled for your project. Please ask your Admin to enable it if you need to access order or sales data.";
  }

  if (integration?.crmEnabled) {
    contextMsg += "\n- CRM Integration is ACTIVE. You can help with customer lists, lead status, and pipeline value.";
    if (isCRMQuery) {
      contextMsg += "\n[MOCK DATA: Total Customers: 850, Active Leads: 120, Pipeline Value: $1.2M, Conversion Rate: 15%]";
    }
  } else if (isCRMQuery) {
    return "The CRM integration is currently disabled for your project. Please ask your Admin to enable it to access customer or lead information.";
  }

  const messages: any[] = [
    { role: "system", content: contextMsg }
  ];

  if (history && history.length > 0) {
    history.forEach((m) => {
      const role = m.role === 'model' ? 'assistant' : m.role;
      messages.push({ role, content: m.content });
    });
  }

  messages.push({ role: "user", content: prompt });

  return openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: messages,
    stream: true,
  });
}

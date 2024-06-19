import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";

const chatGroq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-70b-8192",
});

const gemmaChat = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "gemma-7b-it",
});

export { chatGroq, gemmaChat };

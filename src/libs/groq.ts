import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";

const chatGroq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-8b-8192",
});

export { chatGroq };

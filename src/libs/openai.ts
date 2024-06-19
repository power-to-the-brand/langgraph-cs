import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";

const chatOpenAI = new ChatOpenAI({
  model: "gpt-4o", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
  temperature: 0.9,
  apiKey: process.env.OPENAI_API_KEY,
});

export { chatOpenAI };

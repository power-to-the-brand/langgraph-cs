import dotenv from "dotenv";
dotenv.config();

export const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? "";
export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? "";
export const HUGGINGFACEHUB_API_KEY = process.env.HUGGINGFACEHUB_API_KEY ?? "";
export const COHERE_API_KEY = process.env.COHERE_API_KEY ?? "";
export const JINA_API_KEY = process.env.JINA_API_KEY ?? "";
export const LANGCHAIN_API_KEY = process.env.LANGCHAIN_API_KEY ?? "";
export const LANGCHAIN_TRACING_V2 = process.env.LANGCHAIN_TRACING_V2 ?? "";
export const LANGCHAIN_PROJECT = process.env.LANGCHAIN_PROJECT ?? "";
export const TAVILY_API_KEY = process.env.TAVILY_API_KEY ?? "";
export const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY ?? "";
export const SLACK_API_KEY = process.env.SLACK_API_KEY ?? "";

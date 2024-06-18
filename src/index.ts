import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { ChatGroq } from "@langchain/groq";
import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const chatGroq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-8b-8192",
});

async function generate(state: GraphState) {
  const question = state.question;

  const template = `Answer the below question. \n
    \n
    Question: \n
    {question} \n
    `;

  const prompt = PromptTemplate.fromTemplate(template);

  const chain = prompt.pipe(chatGroq).pipe(new StringOutputParser());

  const result = await chain.invoke({ question });

  return {
    generation: result,
  };
}

type GraphState = {
  question: string;
  generation?: string;
};

const graphState: StateGraphArgs<GraphState>["channels"] = {
  question: {
    value: (left?: string, right?: string) => (right ? right : left || ""),
    default: () => "",
  },
  generation: {
    value: (left?: string, right?: string) => (right ? right : left),
    default: () => undefined,
  },
};

const workflow = new StateGraph<GraphState>({ channels: graphState }).addNode(
  "generate",
  generate
);

// Build Graph
workflow.addEdge(START, "generate");
workflow.addEdge("generate", END);

const app = workflow.compile();

const threadId = "conversation-1";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptQuestion = async () => {
  rl.question("User: ", async (question) => {
    await execute(question);
    promptQuestion(); // Call this function again to ask new question after previous execution
  });
};

const execute = async (question: string) => {
  const inputs = { question };
  const config = { recursionLimit: 50, threadId };
  let finalGeneration;
  for await (const output of await app.stream(inputs, config)) {
    for (const [key, value] of Object.entries(output)) {
      console.log(`Node: '${key}'`);
      // Optional: log full state at each node
      // console.log(JSON.stringify(value, null, 2));
      finalGeneration = value;
    }
    console.log("\n---\n");
  }

  // Log the final generation.
  console.log("Sytem: " + JSON.stringify(finalGeneration, null, 2));
};

promptQuestion();

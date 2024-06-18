import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { ChatGroq } from "@langchain/groq";
import {
  END,
  MemorySaver,
  START,
  StateGraph,
  StateGraphArgs,
} from "@langchain/langgraph";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessage, HumanMessage } from "@langchain/core/messages";

const chatGroq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama3-8b-8192",
});

async function gradeConversation(state: GraphState) {}

async function generate(state: GraphState) {
  const { messages } = state;

  const result = await chatGroq.invoke(messages);

  return {
    generation: result.content.toString(),
    messages: [result],
  };
}

type GraphState = {
  question: string;
  generation?: string;
  messages: BaseMessage[];
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
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  },
};

const workflow = new StateGraph<GraphState>({ channels: graphState }).addNode(
  "generate",
  generate
);

// Build Graph
workflow.addEdge(START, "generate");
workflow.addEdge("generate", END);

const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

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
  const messages = [new HumanMessage(question)];
  const inputs = { messages };

  const config = { recursionLimit: 50, configurable: { threadId } };
  for await (const { messages } of await app.stream(inputs, {
    ...config,
    streamMode: "values",
  })) {
    console.log("msgs-----", messages);
    let msg = messages[messages?.length - 1];
    if (msg?.content) {
      console.log("System: " + msg.content);
    } else if (msg?.tool_calls?.length > 0) {
      console.log(msg.tool_calls);
    } else {
      console.log(msg);
    }
    console.log("-----\n");
  }
};

promptQuestion();

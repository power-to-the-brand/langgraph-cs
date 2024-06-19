import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import {
  END,
  MemorySaver,
  START,
  StateGraph,
  StateGraphArgs,
} from "@langchain/langgraph";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { angryCustomerReply } from "./angry-customer";
import {
  ConversationPhase,
  isCSAskingMoreContext,
  phaseChecker,
} from "./conversation-grader";
import { chatOpenAI } from "libs/openai";
import { formatChatMessagesToLine } from "utils/format-message-to-line";
import chalk from "chalk";

async function checkConversationPhase(state: GraphState) {
  // console.info("---CHECK CONVERSATION PHASE---");

  const { messages } = state;
  const result = await phaseChecker(messages);

  if (result === ConversationPhase.GREETINGS) {
    return "respondGreetings";
  } else if (result === ConversationPhase.PROBLEM_ELABORATION) {
    return "respondProblemElaboration";
  } else {
    return "respondIssueResolution";
  }
}

async function respondGreetings(state: GraphState) {
  const result = await generateResponseNode(ConversationPhase.GREETINGS, state);
  return result;
}

async function respondProblemElaboration(state: GraphState) {
  return await generateResponseNode(
    ConversationPhase.PROBLEM_ELABORATION,
    state
  );
}

async function respondIssueResolution(state: GraphState) {
  return await generateResponseNode(ConversationPhase.ISSUE_RESOLUTION, state);
}

const generateResponseNode = async (
  phase: ConversationPhase,
  state: GraphState
) => {
  // console.log(`---GENERATE RESPONSE FOR PHASE ${phase}---`);
  const { messages } = state;
  let template = `
  Conversation History:\n
  {messages} \n

  [Customer Profile]
  A singaporean, kindly reply using the Singaporean tonnes and localized message style. Please use the local message style moderately!

  [Scenario]
  You have bought a faulty product and seeking for a refund or replacement
  
  Based on the conversation history above, what would you reply as a angry customer?
  `;
  switch (phase) {
    case ConversationPhase.GREETINGS:
      break;
    case ConversationPhase.PROBLEM_ELABORATION:
      template += `\n
      If customer service agent asking for more input from customers, provide the necessary information to the agent but with slightly discontent tone.
      `;
      // TODO: We can pull up some product info here from another node
      break;
    case ConversationPhase.ISSUE_RESOLUTION:
      template += `\n
      If the customer service agent has provided a good resolution, acknowledge the resolution and provide your feedback. \n
      If the provided resolution is not satisfactory, express your dissatisfaction and ask for a better solution. \n
      `;
      break;
    default:
      break;
  }

  const chain = PromptTemplate.fromTemplate(template).pipe(chatOpenAI);

  const result = (await chain.invoke({
    messages: formatChatMessagesToLine(messages),
  })) as unknown as AIMessage;

  return {
    messages: [result],
  };
};

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

const workflow = new StateGraph<GraphState>({ channels: graphState })
  .addNode("respondGreetings", respondGreetings)
  .addNode("respondProblemElaboration", respondProblemElaboration)
  .addNode("respondIssueResolution", respondIssueResolution);

// Build Graph
workflow.addConditionalEdges(START, checkConversationPhase);
workflow.addEdge("respondGreetings", END);
workflow.addEdge("respondProblemElaboration", END);
workflow.addEdge("respondIssueResolution", END);

const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

const threadId = "conversation-1";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptQuestion = async () => {
  rl.question(chalk.yellow("CS Agent: "), async (question) => {
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
    // console.log("msgs-----", messages);
    let msg = messages[messages?.length - 1];
    if (msg?.content && msg instanceof AIMessage) {
      console.log(chalk.greenBright("Customer: " + msg.content + "\n"));
    } else if (msg?.tool_calls?.length > 0) {
      // console.log(msg.tool_calls);
    } else {
      // console.log(msg);
    }
    // console.log("-----\n");
  }
};

console.log(chalk.greenBright("Customer: Hello"));
promptQuestion();

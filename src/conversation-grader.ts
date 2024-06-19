import dotenv from "dotenv";
dotenv.config();

import {
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { chatGroq } from "./libs/groq";
import { formatChatMessagesToLine } from "./utils/format-message-to-line";
import { StringOutputParser } from "@langchain/core/output_parsers";

export enum ConversationPhase {
  GREETINGS = "1",
  PROBLEM_ELABORATION = "2",
  ISSUE_RESOLUTION = "3",
}

async function isCSAskingMoreContext(messages: BaseMessage[]) {
  const template = `
    Conversation History:\n
    {messages}\n

    Based on the conversation history provided above, determine if the customer service agent is asking customer to provides more details about their complaint or enquiry.

    If yes, please reply "yes" in lowercase. Otherwise reply "no" in lowercase.
    `;

  const prompt = PromptTemplate.fromTemplate(template);

  const chain = prompt.pipe(chatGroq);

  const msg = formatChatMessagesToLine(messages);

  const result = await chain.invoke({
    messages: msg,
  });

  //   console.log("result", result.content);

  return result.content.toString();
}

async function phaseChecker(messages: BaseMessage[]) {
  const template = `
   [TASK]
Given the transcript of a customer service interaction as shown below:

Conversation History:
{messages}
  
Determine the current phase of the conversation by evaluating the content and context of the dialogue. The three conversation phases to consider are:
  1. Greetings: where the conversation is primarily introductory or basic pleasantries are exchanged.
  2. Problem Elaboration: where the agent is gathering/requesting more details about the customer’s issue.
  3. Issue Resolution: where the conversation is directed towards problem-solving or detailed issue discussion.

Please indicate the conversation phase by responding with the number corresponding only to the phase described in a lowercase format (e.g., '2').

---
    `;

  const prompt = PromptTemplate.fromTemplate(template);

  const chain = prompt.pipe(chatGroq).pipe(new StringOutputParser());

  const msg = formatChatMessagesToLine(messages);

  const result = await chain.invoke({
    messages: msg,
  });

  return result;
}

export { isCSAskingMoreContext, phaseChecker };

import { chatOpenAI } from "libs/openai";
import { BaseMessage, AIMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";
import { formatChatMessagesToLine } from "utils/format-message-to-line";

async function angryCustomerReply(messages: BaseMessage[]) {
  const template = `
    Conversation History:\n
    {messages}\n
    
    Based on the conversation history provided above, what a angry customer would reply?
    `;

  const prompt = PromptTemplate.fromTemplate(template);

  const chain = prompt.pipe(chatOpenAI);

  const result = (await chain.invoke({
    messages: formatChatMessagesToLine(messages),
  })) as unknown as AIMessage;

  return result;
}

export { angryCustomerReply };

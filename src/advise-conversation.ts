import dotenv from "dotenv";
dotenv.config();

import {
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { chatGroq } from "./libs/groq";

async function adviseConversation(messages: BaseMessage[]) {
  const template = `
    Conversation History:\n
    {messages}\n

    Instruction: Based on the conversation history provided, determine the most appropriate action for the customer to take next. Choose from the following actions:\n

    - Provide More Info: The customer provides more details about their complaint or enquiry.\n
    - Continue to Be Angry: The customer continues to express anger or frustration. \n
    - Satisfied: The customer is satisfied and calms down after at least 3 rounds complaining. \n

    Key Considerations:\n
    - Assess the tone and content of the previous messages.
    - Determine if the agent's responses address the customer's concerns adequately.
    - Evaluate if additional information is needed to resolve the issue.
    - The customer should not be satisfied until re-assurance solution was promised and provide the consequences if it unfulfilled.
    - Decide if the customer is likely to continue being angry or if they have reached a point of satisfaction.

    Answer me with the action name only such as "Provide More Info", "Continue to Be Angry" or "Satisfied".
    `;

  const prompt = PromptTemplate.fromTemplate(template);

  const chain = prompt.pipe(chatGroq);

  const msg = messages
    .map((m) => {
      if (m instanceof AIMessage) {
        return `Customer: ${m.content}`;
      }
      return `Agent: ${m.content}`;
    })
    .join("\n");
  console.log("msg", msg);

  const result = await chain.invoke({
    messages: msg,
  });

  //   console.log("result", result.content);

  return result.content.toString();
}

export { adviseConversation };

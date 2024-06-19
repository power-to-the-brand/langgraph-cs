import { BaseMessage, AIMessage } from "@langchain/core/messages";

const formatChatMessagesToLine = (messages: BaseMessage[]): string => {
  const msg = messages
    .map((m) => {
      if (m instanceof AIMessage) {
        return `Customer: ${m.content}`;
      }
      return `Agent: ${m.content}`;
    })
    .join("\n");
  // console.log("Formatted Chat Messages", msg);
  return msg;
};

export { formatChatMessagesToLine };

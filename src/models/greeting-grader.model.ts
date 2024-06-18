import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
enum GreetingGraderModelResponseEnum {
  YES = "yes",
  NO = "no",
}

const zodResponseSchema = zodToJsonSchema();

const productInquiryGraderPrompt = ChatPromptTemplate.fromTemplate(
  `You are a grader that judges the question if it's related to product inquiry or just a normal greeting/conversation. Answer with 'yes' if you think the question is related to product inquiry and 'no' if not.
  Question: {question}
  Answer: ""
  `
);

const planTool = {
  type: "function",
  function: planFunction,
};
const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
});

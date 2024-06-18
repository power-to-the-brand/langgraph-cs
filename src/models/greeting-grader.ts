import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OPENAI_API_KEY } from "constants/env";

const productInquiryGraderPrompt = ChatPromptTemplate.fromTemplate(
  `You are a grader that judges the question if it's related to product inquiry or just a normal greeting/conversation. Answer with 'yes' if you think the question is related to product inquiry and 'no' if not.
  Question: {question}
  Answer: "yes or no"
  `
);

const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
  apiKey: OPENAI_API_KEY,
});

export const productInquiryGraderLlm = productInquiryGraderPrompt
  .pipe(llm)
  .pipe(new StringOutputParser());

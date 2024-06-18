import { ChatOpenAI } from "@langchain/openai";
import { OPENAI_API_KEY } from "constants/env";
import { createAgent } from "helpers/create-agent";
import { getProductInformationRetrieverTool } from "tools/get-product-information-tool";

const llm = new ChatOpenAI({
  model: "gpt-4o",
  apiKey: OPENAI_API_KEY,
  temperature: 0,
});
const prompt = `You are an expert on Product related Questions. You can use the get-product-information-tool tool to get informations related to the product being asked. 
Pass an object parameter of productName on the tool to proceed.
WIth the best of your abilities, your response should be supported with facts based on the documents received from the tool. 
If you are unable to find the product or you encountered an error, then reply with an honest answer stating that the product does not exist.`;
const productExpertAgent = async () => {
  const agent = await createAgent(
    llm,
    [getProductInformationRetrieverTool],
    prompt
  );
  return agent;
};

export { productExpertAgent };

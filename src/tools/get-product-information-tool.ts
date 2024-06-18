import { OpenAIEmbeddings } from "@langchain/openai";
import { OPENAI_API_KEY, PINECONE_INDEX_NAME } from "constants/env";
import { DynamicStructuredTool } from "@langchain/community/tools/dynamic";
import { z } from "zod";
import { getVectorStore } from "libs/pinecone";

const embeddings = new OpenAIEmbeddings({ apiKey: OPENAI_API_KEY });

const getProductInformationRetrieverTool = new DynamicStructuredTool({
  name: "get-product-information-tool",
  description: "generates a random number between two input numbers",
  schema: z.object({
    productName: z.string().describe("Name of the Product"),
  }),
  func: async ({ productName }) => {
    const vectorStoreIndex = await getVectorStore({
      pineconeIndexName: PINECONE_INDEX_NAME,
      embeddings,
      // Hard Code the Namespace for now.
      namespace: "the-great-room",
    });
    try {
      const documents =
        (await vectorStoreIndex.similaritySearch(productName, 5)) ?? [];

      if (documents.length === 0) {
        return "Did not found any records";
      }

      const formattedResponse = documents
        .map(({ pageContent, metadata }, index) => {
          const metadataString = `${metadata}`;
          return `Result #${index + 1} \
        ${pageContent}

        ==================================================

        ${metadataString}
        `;
        })
        .join(`/n \ /n`);
      return formattedResponse;
    } catch (error) {
      console.error(error);
      return "Failed to get data from retriever";
    }
  },
});

export { getProductInformationRetrieverTool };

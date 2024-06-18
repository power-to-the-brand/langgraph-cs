import { Pinecone } from "@pinecone-database/pinecone";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { Document } from "langchain/document";
import { PineconeStore, PineconeStoreParams } from "@langchain/pinecone";
import { AxiosError } from "axios";
import { PINECONE_API_KEY } from "constants/env";

type UpdatePineconeIndex = {
  pineconeIndexName: string;
  namespace: string;
  embeddings: EmbeddingsInterface;
  docs: Document[];
};

type GetVectorStoreParams = {
  pineconeIndexName: string;
  namespace: string;
  embeddings: EmbeddingsInterface;
};

const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

async function addEmbeddingsToPinecone({
  docs,
  pineconeIndexName,
  namespace,
  embeddings,
}: UpdatePineconeIndex) {
  try {
    console.log("Retrieving Pinecone index...");
    // 1. Retrieve Pinecone index
    const index = pinecone.Index(pineconeIndexName);
    // 2. Process each document in the docs array
    console.log("Updating docs to Pinecone");
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace,
    } as unknown as PineconeStoreParams).catch((error) => {
      console.error("Error in PineconeStore.fromDocuments", error);
    });
    console.log("Done Updating Pinecone Index");
  } catch (error) {
    console.error(
      "Error in update pinecone index",
      (error as AxiosError)?.response?.data
    );
    throw error;
  }
}

async function getVectorStore({
  pineconeIndexName,
  namespace,
  embeddings,
}: GetVectorStoreParams) {
  const pineconeIndex = pinecone.Index(pineconeIndexName);
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace,
  } as unknown as PineconeStoreParams);

  return vectorStore;
}

async function clearPineconeNamespace({
  pineconeIndexName,
  namespace,
}: {
  pineconeIndexName: string;
  namespace: string;
}) {
  const pineconeIndex = pinecone.Index(pineconeIndexName).namespace(namespace);
  await pineconeIndex.deleteAll();
  console.info("Deleted all vectors in namespace", namespace);
}

export { addEmbeddingsToPinecone, getVectorStore, clearPineconeNamespace };

import { Document } from "langchain/document";

const formatDocs = (docs: Document[]) => {
  let content = "";
  docs.forEach((doc) => {
    content += "\n\n" + doc.pageContent;
  });
  return content;
};

export { formatDocs };

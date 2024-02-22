import { Pinecone } from "@pinecone-database/pinecone";
import { convertToASCII } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
    embeddings: number[],
    fileKey: string
) {
    try {
        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });

        const index = pc.index("chatpdf");

        const namespace = index.namespace(convertToASCII(fileKey));
        const queryResult = await namespace.query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true,
        });

        return queryResult.matches || [];
    } catch (error) {
        console.log("Error querying embeddings", error);
        throw error;
    }
}

export async function getContext(query: string, fileKey: string) {
    const queryEmbeddings = await getEmbeddings(query);
    const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

    const qualifyingDocs = matches.filter(
        (match) => match.score && match.score > 0.7
    );

    type Metadata = {
        text: string;
        pageNumber: number;
    };

    let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

    return docs.join("\n").substring(0, 3000);
}

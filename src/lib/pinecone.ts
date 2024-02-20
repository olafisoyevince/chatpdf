import { Pinecone } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";

export const getPineconeClient = async () => {
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });

    return pc;
};

// const index = pc.index("quickstart");

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: {
            pageNumber: number;
        };
    };
};

export async function loadS3IntoPinecone(fileKey: string) {
    // 1. obtain the pdf -> download and read from the pdf

    console.log("Downloading s3 into file system");
    const file_name = await downloadFromS3(fileKey);
    console.log("From the loadS3IntoPinecone function", file_name);
    if (!file_name) {
        throw new Error("Could not download from s3");
    }
    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];

    return pages;
}

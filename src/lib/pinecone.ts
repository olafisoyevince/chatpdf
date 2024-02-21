import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
    Document,
    RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { TextDecoder } from "util";
import md5 from "md5";
import { downloadFromS3 } from "./s3-server";
import { getEmbeddings } from "./embeddings";
import { convertToASCII } from "./utils";

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

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

    // 2. split and segment the pdf into smaller documents
    const documents = await Promise.all(
        pages.map((page) => prepareDocument(page))
    );

    // 3. vectorise and embed individual documents
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    // 4. upload to pinecone
    const index = pc.index("chatpdf");
    const namespace = index.namespace(convertToASCII(fileKey));
    console.log("Inserting vectors into Pinecone");
    await namespace.upsert(vectors as any);

    return documents[0];
}

async function embedDocument(doc: Document) {
    try {
        console.log(
            "From the beginning of the embed document function",
            doc.pageContent
        );
        const embeddings = await getEmbeddings(doc.pageContent);
        const hash = md5(doc.pageContent);

        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber,
            },
        } as PineconeRecord;
    } catch (error) {
        console.error("Error embedding document", error);
        throw error;
    }
}

export const truncateStringByBytes = (string: string, bytes: number) => {
    const enc = new TextEncoder();

    return new TextDecoder("utf-8").decode(enc.encode(string).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
    let { pageContent, metadata } = page;
    pageContent = pageContent.replace(/\n/g, "");

    //split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateStringByBytes(pageContent, 36000),
            },
        }),
    ]);

    return docs;
}

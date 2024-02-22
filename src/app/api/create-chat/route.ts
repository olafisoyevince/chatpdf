// /api/create-chat

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { file_key, file_name } = body;
        const document = await loadS3IntoPinecone(file_key);

        console.log("The create-chat endpoint", document);

        // create a new chat
        const chat_Id = await db
            .insert(chats)
            .values({
                fileKey: file_key,
                pdfName: file_name,
                pdfUrl: getS3Url(file_key),
                userId,
            })
            .returning({
                insertedId: chats.id,
            });

        return NextResponse.json(
            {
                chat_Id: chat_Id[0].insertedId,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

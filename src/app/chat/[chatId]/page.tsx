"use client";

import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { useEffect } from "react";

type Props = {
    params: {
        chatId: string;
    };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
    const { userId } = await auth();

    if (!userId) {
        return redirect("/sign-in");
    }

    const _chats = await db
        .select()
        .from(chats)
        .where(eq(chats.userId, userId));

    if (!_chats) {
        return redirect("/");
    }

    // if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    //     return redirect("/");
    // }

    const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

    console.log(_chats);
    console.log(chatId);

    useEffect(() => {
        const messageContainer = document.getElementById("message-container");

        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    return (
        <div
            className=" flex max-h-screen overflow-scroll no-scrollbar "
            id="message-container"
        >
            <div className=" flex w-full max-h-screen overflow-scroll no-scrollbar">
                {/* chat sidebar */}
                <div className=" flex-[1] max-w-xs">
                    <ChatSideBar chatId={parseInt(chatId)} />
                </div>

                {/* pdf viewer */}
                <div className=" max-h-screen p-4 no-scrollbar overflow-scroll flex-[5]">
                    <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
                </div>

                {/* chat component */}
                <div className=" flex-[3] border-l-4 border-l-slate-200 ">
                    <ChatComponent chatId={parseInt(chatId)} />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;

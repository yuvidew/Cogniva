import prisma from "@/lib/db";
import { inngest } from "./client";
import { APPWRITER_BUCKET_ID, APPWRITER_KEY, ENDPOINT, PROJECT_ID } from "@/lib/config";

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");

    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: `Workflow for ${event.data.email}`,
        },
      });
    });

    return { message: `Hello ${event.data.email}!` };
  },
);

export const processChatMessage = inngest.createFunction(
  { id: "process-chat-message", retries: 2 },
  { event: "agent/chat.message" },
  async ({ event, step }) => {
    const { agentId, chatId, userMessageContent } = event.data as {
      agentId: string;
      chatId: string;
      userMessageContent: string;
    };

    // Step 1: Fetch agent system prompt, conversation history, and uploaded files
    const { agent, history, files } = await step.run("fetch-context", async () => {
      const [agent, history, files] = await Promise.all([
        prisma.agent.findFirstOrThrow({
          where: { id: agentId },
          select: { systemPrompt: true, temperature: true },
        }),
        prisma.chatMessage.findMany({
          where: { chatId },
          orderBy: { createdAt: "asc" },
        }),
        // Fetch all knowledge-base files linked to this agent
        prisma.fileUpload.findMany({
          where: { agentId },
          select: { fileUrl: true, mimeType: true, fileName: true },
        }),
      ]);
      return { agent, history, files };
    });

    // Step 2: Call Gemini — inject uploaded file contents into the first user message
    const text = await step.run("call-gemini", async () => {
      // Download each file from Appwrite and convert to base64
      const fileParts = await Promise.all(
        files.map(async (file) => {
          // Extract the Appwrite file ID from the stored URL
          const fileIdMatch = file.fileUrl.match(/\/files\/([^/]+)\/view/);
          if (!fileIdMatch?.[1]) return null;

          const downloadUrl = `${ENDPOINT}/storage/buckets/${APPWRITER_BUCKET_ID}/files/${fileIdMatch[1]}/download?project=${PROJECT_ID}`;
          const res = await fetch(downloadUrl, {
            headers: {
              "X-Appwrite-Project": PROJECT_ID,
              "X-Appwrite-Key": APPWRITER_KEY,
            },
          });
          if (!res.ok) return null;

          const buffer = await res.arrayBuffer();
          return {
            type: "file" as const,
            data: Buffer.from(buffer),
            mediaType: file.mimeType as `${string}/${string}`,
          };
        })
      );

      const validFileParts = fileParts.filter(Boolean) as {
        type: "file";
        data: Buffer;
        mediaType: `${string}/${string}`;
      }[];

      // Build messages — attach files inline to the first user message so Gemini can read them
      const messages = history.map((msg, index) => {
        const isFirstUserMsg = index === 0 && msg.role === "user" && validFileParts.length > 0;
        if (isFirstUserMsg) {
          return {
            role: "user" as const,
            content: [
              ...validFileParts,
              { type: "text" as const, text: msg.content },
            ],
          };
        }
        return {
          role: msg.role as "user" | "assistant",
          content: msg.content,
        };
      });

      const result = await generateText({
        model: google("gemini-2.5-flash"),
        system: agent.systemPrompt,
        temperature: agent.temperature,
        messages,
      });
      return result.text;
    });

    // Step 3: Save AI response + update chat
    await step.run("save-response", async () => {
      await prisma.chatMessage.create({
        data: {
          content: text,
          role: "assistant",
          chatId,
        },
      });

      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });
    });

    // Step 4: Generate a smart title on the first message (like OpenAI)
    const isFirstMessage = history.length === 1;
    if (isFirstMessage) {
      const title = await step.run("generate-title", async () => {
        const result = await generateText({
          model: google("gemini-2.5-flash"),
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: `Generate a short, concise chat title (max 6 words, no quotes, no punctuation at end) that summarizes this conversation:\n\nUser: ${userMessageContent}\nAssistant: ${text}`,
            },
          ],
        });
        return result.text.trim().replace(/^["']|["']$/g, "");
      });

      await step.run("update-title", async () => {
        await prisma.chat.update({
          where: { id: chatId },
          data: { title },
        });
      });
    }

    return { success: true };
  },
);


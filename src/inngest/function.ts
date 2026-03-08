import prisma from "@/lib/db";
import { inngest } from "./client";

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

    // Step 1: Fetch agent system prompt and conversation history
    const { agent, history } = await step.run("fetch-context", async () => {
      const agent = await prisma.agent.findFirstOrThrow({
        where: { id: agentId },
        select: { systemPrompt: true, temperature: true },
      });
      const history = await prisma.chatMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
      });
      return { agent, history };
    });

    // Step 2: Call Gemini
    const text = await step.run("call-gemini", async () => {
      const result = await generateText({
        model: google("gemini-2.5-flash"),
        system: agent.systemPrompt,
        temperature: agent.temperature,
        messages: history.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      });
      return result.text; // Return only the plain string so Inngest can serialize it
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


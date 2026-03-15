import prisma from "@/lib/db";
import { inngest } from "./client";
import { APPWRITER_BUCKET_ID, APPWRITER_KEY, ENDPOINT, PROJECT_ID } from "@/lib/config";

import { google } from '@ai-sdk/google';
import { generateText, experimental_generateImage as generateImage } from 'ai';
import { createAdminClient } from "@/server/appwriter";
import { ID, Permission, Role } from "node-appwrite";


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
    const { agent, history, files, userId } = await step.run("fetch-context", async () => {
      const [agent, history, files, chat] = await Promise.all([
        prisma.agent.findFirstOrThrow({
          where: { id: agentId },
          select: { systemPrompt: true, temperature: true, imageGenerationEnabled: true, ownerId: true },
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
        prisma.chat.findFirst({
          where: { id: chatId },
          select: { userId: true },
        }),
      ]);
      return { agent, history, files, userId: chat?.userId || agent.ownerId };
    });

    // Step 2: Detect if user wants to generate an image
    const isImageRequest = await step.run("detect-image-request", async () => {
      console.log("[Image Detection] imageGenerationEnabled:", agent.imageGenerationEnabled);
      console.log("[Image Detection] userMessage:", userMessageContent);
      
      if (!agent.imageGenerationEnabled) {
        console.log("[Image Detection] Image generation is disabled for this agent");
        return false;
      }
      
      const lowerContent = userMessageContent.toLowerCase();
      
      // Check for explicit image generation phrases
      const explicitPhrases = [
        'generate image', 'create image', 'make image', 'generate an image',
        'create an image', 'make an image', 'generate picture', 'create picture',
        'generate a picture', 'create a picture', 'make a picture',
        'generate illustration', 'create illustration', 'generate an illustration',
        'create an illustration', 'generate artwork', 'create artwork',
        'draw me', 'draw a', 'draw an', 'draw the',
      ];
      
      if (explicitPhrases.some(phrase => lowerContent.includes(phrase))) {
        return true;
      }
      
      // Check for pattern: "generate/create/make ... image/picture/illustration"
      // This catches "generate an architectural floor plan image"
      const actionWords = ['generate', 'create', 'make', 'draw'];
      const imageWords = ['image', 'picture', 'illustration', 'artwork', 'visual', 'graphic', 'drawing'];
      
      const hasAction = actionWords.some(action => lowerContent.includes(action));
      const hasImageWord = imageWords.some(word => lowerContent.includes(word));
      
      console.log("[Image Detection] hasAction:", hasAction, "hasImageWord:", hasImageWord);
      
      // If the message contains both an action word AND an image word, it's likely an image request
      if (hasAction && hasImageWord) {
        console.log("[Image Detection] DETECTED as image request!");
        return true;
      }
      
      console.log("[Image Detection] NOT an image request");
      return false;
    });

    console.log("[Process] isImageRequest:", isImageRequest);

    let text: string;
    let generatedImageUrl: string | null = null;

    if (isImageRequest) {
      console.log("[Process] Starting image generation...");
      // Step 3a: Generate image using Gemini
      const imageResult = await step.run("generate-image", async (): Promise<{
        success: boolean;
        imageData?: string;
        mimeType?: string;
        prompt: string;
        error?: string;
      }> => {
        try {
          // Extract the image prompt from the user's message
          // Remove common prefixes to get the actual prompt
          let imagePrompt = userMessageContent
            .replace(/^(generate|create|make|draw)\s+(an?\s+)?(image|picture|illustration|artwork|visual)\s+(of\s+)?/i, '')
            .replace(/^(generate|create|make)\s+(me\s+)?(an?\s+)?(image|picture|illustration|artwork|visual)\s+(of\s+)?/i, '')
            .trim();
          
          // If the prompt is too short, use the full message
          if (imagePrompt.length < 10) {
            imagePrompt = userMessageContent;
          }

          const result = await generateImage({
            model: google.image('gemini-2.5-flash-image'),
            prompt: imagePrompt,
          });

          // The result contains base64 image data
          return {
            success: true,
            imageData: result.image.base64,
            mimeType: 'image/png',
            prompt: imagePrompt,
          };
        } catch (error) {
          console.error("Image generation error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate image',
            prompt: userMessageContent,
          };
        }
      });

      if (imageResult.success && imageResult.imageData) {
        // Step 3b: Upload to Appwrite
        const uploadResult = await step.run("upload-image", async (): Promise<{
          success: boolean;
          imageUrl?: string;
          error?: string;
        }> => {
          try {
            const { storage } = await createAdminClient();
            const buffer = Buffer.from(imageResult.imageData!, 'base64');
            const fileName = `generated-${Date.now()}.png`;
            
            // Create a File-like object from the buffer
            const file = new File([buffer], fileName, { type: imageResult.mimeType || 'image/png' });
            
            const uploaded = await storage.createFile(
              APPWRITER_BUCKET_ID,
              ID.unique(),
              file,
              [Permission.read(Role.any())]
            );

            const imageUrl = `${ENDPOINT}/storage/buckets/${APPWRITER_BUCKET_ID}/files/${uploaded.$id}/view?project=${PROJECT_ID}`;

            // Save to GeneratedImage table
            await prisma.generatedImage.create({
              data: {
                prompt: imageResult.prompt,
                imageUrl,
                width: 1024,
                height: 1024,
                model: 'gemini-2.0-flash-exp',
                status: 'completed',
                userId,
                agentId,
              },
            });

            return { success: true, imageUrl };
          } catch (error) {
            console.error("Upload error:", error);
            return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
          }
        });

        if (uploadResult.success && uploadResult.imageUrl) {
          generatedImageUrl = uploadResult.imageUrl;
          text = `I've generated the image based on your request!\n\n![Generated Image](${generatedImageUrl})\n\n**Prompt used:** ${imageResult.prompt}`;
        } else {
          text = `I was able to generate the image, but there was an error uploading it: ${uploadResult.error}`;
        }
      } else {
        text = `I apologize, but I couldn't generate the image. Error: ${imageResult.error}\n\nPlease try again with a different prompt or check if image generation is enabled for this agent.`;
      }
    } else {
      // Step 3: Regular chat - Call Gemini for text response
      text = await step.run("call-gemini", async () => {
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
    }

    // Step 4: Save AI response + update chat
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

    // Step 5: Generate a smart title on the first message (like OpenAI)
    const isFirstMessage = history.length === 1;
    if (isFirstMessage) {
      const title = await step.run("generate-title", async () => {
        const result = await generateText({
          model: google("gemini-2.5-flash"),
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: `Generate a short, concise chat title (max 6 words, no quotes, no punctuation at end) that summarizes this conversation:\n\nUser: ${userMessageContent}\nAssistant: ${text.substring(0, 200)}`,
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

    return { success: true, generatedImageUrl };
  },
);


import prisma from "@/lib/db";
import { inngest } from "./client";


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
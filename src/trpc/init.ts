import { auth } from '@/lib/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const heads = await headers();
  return {
    userId: 'user_123',
    headers: heads,
  };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const router = t.router;
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
    // Prefer the request headers from the current tRPC call so cookies are preserved
    let session = null;
    
    try {
        session = await auth.api.getSession({
            headers: ctx.headers,
        });
    } catch (err) {
        console.error("getSession failed", err);
        // Session retrieval failed, session remains null
    }

    if (!session) {
        throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Unauthorized",
        });
    }

    return next({
        ctx: { ...ctx, auth: session },
    });
});
import { protectedProcedure, router } from "@/trpc/init";
import { TRPCError } from "@trpc/server/unstable-core-do-not-import";


export const profileRouter = router({
    getUser: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.auth.user;

        if (!user) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

    
        return {
            id: user.id,
            email: user.email,
            name: user.name,
        };
    }
    ),
})
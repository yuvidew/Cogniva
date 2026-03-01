
import {checkout, polar, portal} from '@polar-sh/better-auth';
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { polarClient } from './polar';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp : true,
            use: [
                checkout({
                    products : [
                        {
                            productId: "843eb9f1-e90c-4bfd-b337-c69f65da5e5a",
                            slug: "cognvia-pro" 
                        
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly : true
                }),
                portal(),
            ]
        })
    ]
});
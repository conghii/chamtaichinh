
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    debug: true,
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const email = (credentials.username as string || "").trim()
                const password = credentials.password as string

                if (!email || !password) return null

                // Simple Auth (Migration from Prisma)
                // In future, use Google Sheets or Env Vars for User Storage
                if (email === "conghee" && password === "123456") {
                    return { id: "1", name: "Cong Hee", email: "conghee" }
                }

                return null
            },
        }),
    ],
})

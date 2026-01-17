
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    providers: [], // Providers added in auth.ts
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/reconciliation') || nextUrl.pathname.startsWith('/settings')
            const isOnLogin = nextUrl.pathname.startsWith('/login')

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect to login
            } else if (isOnLogin) {
                if (isLoggedIn) {
                    return Response.redirect(new URL('/', nextUrl))
                }
            }
            return true
        },
    },
} satisfies NextAuthConfig

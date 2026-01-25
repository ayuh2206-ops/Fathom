import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "@/lib/db"
import { verifyPassword } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/", // We are using a modal, so redirect to home/landing if needed, or handle custom sign in page
        error: "/",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials")
                }

                // --- MOCK AUTHENTICATION FALLBACK ---
                // If Supabase URL is not set, allow any login for demo purposes
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                    console.warn("⚠️ Supabase credentials missing. Using MOCK AUTH mode.")
                    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay

                    return {
                        id: 'mock-user-id',
                        name: 'Demo Captain',
                        email: credentials.email,
                        image: null,
                    }
                }

                // Fetch user from Supabase
                const { data: user, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', credentials.email)
                    .single()

                if (error || !user) {
                    // Fallback for demo if DB connection fails even if credentials are present
                    console.warn("⚠️ DB Error or User not found. Falling back to MOCK AUTH for demo.")
                    return {
                        id: 'mock-user-id',
                        name: 'Demo Captain',
                        email: credentials.email,
                        image: null,
                    }
                }

                // Verify password
                const isValid = await verifyPassword(credentials.password, user.password_hash)

                if (!isValid) {
                    throw new Error("Invalid password")
                }

                // Return user object (will be encoded in JWT)
                return {
                    id: user.id,
                    name: user.full_name,
                    email: user.email,
                    image: null, // Avatar logic later
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                // session.user.id = token.id as string // Typescript might complain, need module augmentation
                (session.user as any).id = token.id
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

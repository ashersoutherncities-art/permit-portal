import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { data: user, error } = await supabase
          .from('customers')
          .select('*')
          .eq('email', credentials.email)
          .single()

        if (error || !user) {
          return null
        }

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!passwordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const { data: existingUser } = await supabase
          .from('customers')
          .select('id')
          .eq('email', user.email!)
          .single()

        if (!existingUser) {
          await supabase.from('customers').insert({
            email: user.email,
            google_id: account.providerAccountId,
            name: user.name,
            created_at: new Date().toISOString(),
          })
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub!
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
})

export { handler as GET, handler as POST }

import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: '사용자명', type: 'text' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        const adminUser = process.env.ADMIN_USER!;
        const adminPassword = process.env.ADMIN_PASSWORD!;       
        if (
          credentials?.username === adminUser &&
          credentials?.password === adminPassword
        ) {
          return {
            id: 'admin-1',
            name: adminUser,
            email: `${adminUser}@admin.com`,
            isAdmin: true,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const adminUser = process.env.ADMIN_USER!;

      // Credentials 로그인은 authorize에서 이미 검증
      if (account?.provider === 'credentials') {
        return true;
      }

      // OAuth 로그인 시 관리자 이메일 체크
      if (!user.email) return false;

      const isAdmin =
        user.email.includes(adminUser) || user.name?.includes(adminUser);

      if (!isAdmin) return false;

      try {
        await db.update(users)
          .set({ isAdmin: true })
          .where(eq(users.email, user.email));
      } catch (err) {
        console.error('DB 관리자 권한 업데이트 실패:', err);
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin ?? false;
        token.id = user.id ?? 'admin-1';
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt', // ✅ 꼭 JWT 전략 써야 middleware에서 token 사용 가능
  },
};
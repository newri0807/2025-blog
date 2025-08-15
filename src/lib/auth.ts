import {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import {DrizzleAdapter} from "@auth/drizzle-adapter";
import {db} from "./db";
import {users} from "./schema";
import {eq} from "drizzle-orm";

if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET 환경변수가 설정되지 않았습니다");
}

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,

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
            name: "credentials",
            credentials: {
                username: {label: "사용자명", type: "text"},
                password: {label: "비밀번호", type: "password"},
            },
            async authorize(credentials) {
                try {
                    const adminUser = process.env.ADMIN_USER;
                    const adminPassword = process.env.ADMIN_PASSWORD;

                    if (!adminUser || !adminPassword) {
                        console.error("ADMIN_USER 또는 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다");
                        return null;
                    }

                    if (credentials?.username === adminUser && credentials?.password === adminPassword) {
                        return {
                            id: "admin-1",
                            name: adminUser,
                            email: `${adminUser}@admin.com`,
                            isAdmin: true,
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Credentials 인증 에러:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({user, account}) {
            try {
                const adminUser = process.env.ADMIN_USER;

                if (!adminUser) {
                    console.error("ADMIN_USER 환경변수가 설정되지 않았습니다");
                    return false;
                }

                if (account?.provider === "credentials") {
                    return true;
                }

                if (!user.email) {
                    console.log("사용자 이메일이 없습니다");
                    return false;
                }

                const isAdmin = user.email.includes(adminUser) || user.name?.includes(adminUser);

                if (!isAdmin) {
                    console.log(`관리자가 아닌 사용자 로그인 시도: ${user.email}`);
                    return false;
                }

                try {
                    await db.update(users).set({isAdmin: true}).where(eq(users.email, user.email));
                    console.log(`관리자 권한 업데이트 성공: ${user.email}`);
                } catch (dbError) {
                    console.error("DB 관리자 권한 업데이트 실패:", dbError);
                }

                return true;
            } catch (error) {
                console.error("signIn 콜백 에러:", error);
                return false;
            }
        },

        async jwt({token, user}) {
            try {
                if (user) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    token.isAdmin = (user as any).isAdmin ?? false;
                    token.id = user.id ?? "admin-1";
                }
                return token;
            } catch (error) {
                console.error("JWT 콜백 에러:", error);
                return token;
            }
        },

        async session({session, token}) {
            try {
                if (session.user) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (session.user as any).id = token.id as string;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (session.user as any).isAdmin = token.isAdmin ?? false;
                }
                return session;
            } catch (error) {
                console.error("Session 콜백 에러:", error);
                return session;
            }
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    // 개발환경에서 디버깅 활성화
    debug: process.env.NODE_ENV === "development",
};

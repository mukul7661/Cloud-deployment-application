import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import prismaAdapter, { prisma } from "@/app/prismaAdapter";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  adapter: prismaAdapter,
  callbacks: {
    async session({ session, token, user }) {
      const getToken = await prisma.account.findFirst({
        where: {
          userId: user.id,
        },
      });

      let accessToken: string | null = null;
      if (getToken) {
        accessToken = getToken.access_token!;
      }
      console.log(accessToken, "accestoken");
      session.user.token = accessToken;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async signIn({ user, account, profile, email, credentials }) {
      console.log(user, "user", account, "account");
      user.token = account?.access_token;

      await prisma.account.update({
        where: {
          provider_providerAccountId: {
            providerAccountId: account?.providerAccountId,
            provider: account?.provider,
          },
        },
        data: {
          access_token: account?.access_token,
        },
      });
      return user;
    },

    signOut: async (req, res) => {
      console.log("User signed out");

      return "/custom-sign-out-page";
    },
  },

  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

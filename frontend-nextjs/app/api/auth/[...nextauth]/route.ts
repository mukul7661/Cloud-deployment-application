import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import prismaAdapter, { prisma } from "@/app/prismaAdapter";
import { serialize } from "cookie";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  adapter: prismaAdapter,
  callbacks: {
    // async session({ session }) {
    //   // console.log(session, "session");
    //   return session;
    // },

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

      session.user.token = accessToken;
      return session;
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async signIn({ user, account, profile, email, credentials }) {
      // console.log(user, account, profile, email, credentials, "hehe");

      // try {
      //   const email = user.email;
      //   const userRecieved = await prisma.user.findUnique({
      //     where: {
      //       email,
      //     },
      //   });
      //   if (userRecieved) {
      //     await prisma.account.create({
      //       data: { ...account, userId: userRecieved.id },
      //     });

      //     const cookieValue = serialize("access-token", account?.access_token, {
      //       httpOnly: true,
      //       maxAge: 30 * 60 * 60 * 24,
      //       path: "/",
      //     });

      //     // console.log(cookieValue, "cookieValue");

      //     if (typeof window !== "undefined") {
      //       document.cookie = cookieValue;
      //     }
      //   }
      // } catch (err) {
      //   console.log("Error: ", err);
      // }

      user.token = account.token;
      return user;
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

// export default NextAuth(authOptions);
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

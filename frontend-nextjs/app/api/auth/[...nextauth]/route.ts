import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import prismaAdapter, { prisma } from "@/app/prismaAdapter";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  adapter: prismaAdapter,
  // callbacks: {
  //   async session({ session }) {
  //     console.log(session, "session");
  //     return session;
  //   },

  //   async signIn({ user, account, profile, email, credentials }) {
  //     console.log(user, account, profile, email, credentials, "hehe");

  //     // await prisma.account.create({ data: account });

  //     // // const res3 = await prisma.account.findMany();
  //     // // console.log(res3, "re3");
  //     // const res1 = await prisma.user.findMany();
  //     // console.log(res1, "res1");

  //     // const res2 = await prisma.VerificationToken.findMany();
  //     // console.log(res2, "res2");

  //     return true;
  //   },
  // },

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

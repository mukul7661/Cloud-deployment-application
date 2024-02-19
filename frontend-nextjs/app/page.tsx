"use client";

import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// async function getServerSideProps() {
//   const session = await getServerSession(authOptions);

//   return {
//     props: {
//       session,
//     },
//   };
// }

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (session !== null) {
    router.push("/projects");
  }

  console.log(session, status);

  return <div>home page</div>;
}

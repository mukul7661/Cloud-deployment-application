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

  console.log(session, status);

  return (
    <div>
      {session && (
        <>
          <Button onClick={() => signOut()}>Sign out</Button>
          <Button onClick={() => router.push("/projects/create")}>
            Create project
          </Button>
        </>
      )}
      {!session && <Button onClick={() => signIn()}>Sign in</Button>}
      <Button onClick={() => router.push("/projects/guest/123")}>
        Deploy as guest
      </Button>
    </div>
  );
}

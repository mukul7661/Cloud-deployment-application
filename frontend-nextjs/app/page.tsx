"use client";

import { Button } from "@/components/ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { serialize } from "cookie";

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
  console.log(session);
  if (session !== null) {
    if (session?.user?.token) {
      console.log("setting cookie");
      const cookieValue = serialize("access-token", session?.user?.token, {
        httpOnly: true,
        maxAge: 30 * 60 * 60 * 24,
        path: "/",
      });

      document.cookie = cookieValue;
    }
    // router.push("/projects");
  }

  console.log(session, status);

  return (
    <div>
      Using kafka, AWS ECS, redis, postgres, docker under the hood for seamless
      deployment experience
    </div>
  );
}

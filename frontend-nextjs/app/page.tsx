"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { serialize } from "cookie";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

async function fetchServerSession() {
  const session = await getServerSession(authOptions);

  return {
    props: {
      session,
    },
  };
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // const serverSession = fetchServerSession();
    // console.log(serverSession, "server");

    if (session !== null) {
      if (session?.user?.token) {
        console.log("setting cookie");
        const cookieValue = serialize("access-token", session?.user?.token, {
          // httpOnly: true,
          maxAge: 30 * 60 * 60 * 24,
          path: "/",
        });

        document.cookie = cookieValue;
      }
      setLoading(true);
      router.push("/projects");
      setLoading(false);
    }
    setLoading(false);
  }, [session, router]);

  return (
    <>
      {(status === "loading" || loading) && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}
      {!loading && !(status === "loading") && (
        <>
          Using kafka, AWS ECS, redis, postgres, docker under the hood for
          seamless deployment experience
        </>
      )}
    </>
  );
}

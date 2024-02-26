"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { serialize } from "cookie";
import { authInstance } from "@/lib/authInstance";

export default function GuestProject() {
  const { data: session, status } = useSession();
  // console.log("status", status);
  // console.log("session", session);

  const router = useRouter();

  const [repoURL, setRepoURL] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const isValidURL: [boolean, string | null] = useMemo(() => {
    if (!repoURL || repoURL.trim() === "") return [false, null];
    const regex = new RegExp(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/
    );
    return [regex.test(repoURL), "Enter valid Github Repository URL"];
  }, [repoURL]);

  const handleClickDeploy = useCallback(async () => {
    // console.log(repoURL);
    setLoading(true);
    const { data } = await authInstance.post(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/create`,
      {
        gitURL: repoURL,
        name: "guest-project",
        isGuest: true,
      },
      { withCredentials: true }
    );

    console.log(data?.project?.id);

    const projectId = data?.project?.id;

    const res = await authInstance.post(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/deploy`,
      {
        projectId,
        isGuest: true,
      },
      { withCredentials: true }
    );
    console.log(res);

    const deploymentId = res?.data?.data?.deploymentId;
    router.push(`/projects/guest/${deploymentId}`);
  }, [repoURL, router]);

  useEffect(() => {
    const cookieValue = serialize("is-guest", "true", {
      // httpOnly: true,
      maxAge: 30 * 60 * 60 * 24,
      path: "/",
    });

    document.cookie = cookieValue;

    return () => {
      document.cookie =
        "is-guest=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };
  }, []);

  return (
    <>
      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}
      {!loading && (
        <main className="flex justify-center items-center mt-40">
          <div className="w-[600px]">
            <span className="flex justify-start items-center gap-2">
              <Github className="text-5xl" />
              <Input
                disabled={loading}
                value={repoURL}
                onChange={(e) => setRepoURL(e.target.value)}
                type="url"
                placeholder="Github URL"
              />
            </span>
            <Button
              onClick={handleClickDeploy}
              disabled={!isValidURL[0] || loading}
              className="w-full mt-3"
            >
              Deploy
            </Button>
          </div>
        </main>
      )}
    </>
  );
}

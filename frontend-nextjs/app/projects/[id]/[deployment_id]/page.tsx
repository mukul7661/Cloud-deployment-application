"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Fira_Code } from "next/font/google";
import { useSession } from "next-auth/react";
import { serialize } from "cookie";
import { authInstance } from "@/lib/authInstance";
import { z } from "zod";
import { DeploymentSchema } from "@/types/zod-types";

const firaCode = Fira_Code({ subsets: ["latin"] });

const ResponseSchema = z.object({
  data: z.object({
    logs: z.array(z.string()),
    status: z.string(),
  }),
});

const Deployment = () => {
  const session = useSession();

  const router = useRouter();

  const path = usePathname();
  const pathArray = path.split("/");
  const deploymentId = pathArray[pathArray.length - 1];
  console.log(deploymentId, "deploymentId");

  const [logs, setLogs] = useState<string[]>(["Logs will appear here soon!"]);
  const [deploymentStatus, setDeploymentStatus] = useState("QUEUED");

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const res: z.infer<typeof ResponseSchema> = await authInstance.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/logs/${deploymentId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        const parsedResponse = ResponseSchema.safeParse(res);
        if (!parsedResponse?.success) {
          console.error("Error: ", parsedResponse?.error);
          return;
        }

        setLogs(parsedResponse?.data?.data?.logs);
        setDeploymentStatus(parsedResponse?.data?.data?.status);
      } catch (err) {
        console.log("Error: ", err);
      }
    }

    fetchProjectDetails();

    const fetchLogsInterval = setInterval(() => {
      fetchProjectDetails();
    }, parseInt(process.env.NEXT_PUBLIC_LOG_REFRESH_TIME as string));

    return () => {
      clearInterval(fetchLogsInterval);
    };
  }, [deploymentId]);

  useEffect(() => {
    const cookieValue = serialize("is-guest", "true", {
      httpOnly: true,
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
    <div className="w-[900px] m-auto mt-20">
      <div
        className={`${firaCode.className} text-sm text-green-500 logs-container mt-5 border-green-500 border-2 rounded-lg p-4 h-[500px] overflow-y-auto`}
      >
        status: {deploymentStatus}
        <pre className="flex flex-col gap-1">
          {logs.map((log, i) => (
            <code key={i}>{`> ${log}`}</code>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default Deployment;

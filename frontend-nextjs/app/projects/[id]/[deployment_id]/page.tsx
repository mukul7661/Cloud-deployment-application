"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Fira_Code } from "next/font/google";
import { useSession } from "next-auth/react";
import { serialize } from "cookie";
import { authInstance } from "@/lib/authInstance";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const firaCode = Fira_Code({ subsets: ["latin"] });

const ResponseSchema = z.object({
  data: z.object({
    logs: z.array(z.string()),
    status: z.string(),
    subDomain: z.string(),
  }),
});

const Deployment = () => {
  const session = useSession();

  const router = useRouter();

  const path = usePathname();
  const pathArray = path.split("/");
  const deploymentId = pathArray[pathArray.length - 1];
  // console.log(deploymentId, "deploymentId");

  const [logs, setLogs] = useState<string[]>(["Logs will appear here soon!"]);
  const [deploymentStatus, setDeploymentStatus] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [subDomain, setSubDomain] = useState("");

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

        setSubDomain(
          `http://${parsedResponse?.data?.data?.subDomain}.mukulyadav.com:8000`
        );
        setLogs(parsedResponse?.data?.data?.logs);
        switch (parsedResponse?.data?.data?.status) {
          case "QUEUED":
            setDeploymentStatus("In Queue");
            break;
          case "IN_PROGRESS":
            setDeploymentStatus("In Progress");
            break;
          case "READY":
            setDeploymentStatus("Ready");
            break;
          case "FAILED":
            setDeploymentStatus("Failed");
            break;
        }
      } catch (err) {
        console.log("Error: ", err);
      } finally {
        setLoading(false);
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
        <div className="flex flex-col items-center">
          <div className="mt-2 bg-slate-900 py-4 px-2 rounded-lg">
            <p>
              Preview URL{" "}
              <a
                target="_blank"
                className="text-sky-400 bg-sky-950 px-3 py-2 rounded-lg"
                href={subDomain}
              >
                {subDomain}
              </a>
            </p>
          </div>
          <Button className="mt-10 w-[300px]" variant={"secondary"}>
            <span className=" mr-2">Status of this deplpoyment:</span>
            <span>{deploymentStatus}</span>
          </Button>
          <div className="w-[800px] m-auto mt-5">
            <div
              className={`${firaCode.className} text-sm text-green-500 logs-container mt-5 border-green-500 border-2 rounded-lg p-4 h-[400px] overflow-y-auto`}
            >
              status: {deploymentStatus}
              <pre className="flex flex-col gap-1">
                {logs.map((log, i) => (
                  <code key={i}>{`> ${log}`}</code>
                ))}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Deployment;

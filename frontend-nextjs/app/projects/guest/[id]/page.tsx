"use client";

import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Fira_Code } from "next/font/google";
import { useSession } from "next-auth/react";
import { authInstance } from "@/lib/authInstance";

const firaCode = Fira_Code({ subsets: ["latin"] });

const Deployment = () => {
  const session = useSession();

  const router = useRouter();

  if (session?.data === null) {
    router.push("/");
  }
  const path = usePathname();
  const pathArray = path.split("/");
  const deploymentId = pathArray[pathArray.length - 1];
  console.log(deploymentId, "deploymentId");

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const res = await authInstance.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/logs/${deploymentId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (res?.data === "") {
          // router.push("/");
        }
        console.log(res?.data?.logs);
        setLogs(res?.data?.logs);

        // setDeployments(res?.data?.Deployment);
      } catch (err) {
        console.log("Error: ", err);
      }
    }

    fetchProjectDetails();

    const fetchLogsInterval = setInterval(() => {
      fetchProjectDetails();
    }, 8000);

    return () => {
      clearInterval(fetchLogsInterval);
    };
  }, []);

  return (
    <div className="w-[900px] m-auto mt-20">
      {logs?.length > 0 && (
        <div
          className={`${firaCode.className} text-sm text-green-500 logs-container mt-5 border-green-500 border-2 rounded-lg p-4 h-[500px] overflow-y-auto`}
        >
          <pre className="flex flex-col gap-1">
            {logs.map((log, i) => (
              <code
                // ref={logs.length - 1 === i ? logContainerRef : undefined}
                key={i}
              >{`> ${log?.log}`}</code>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Deployment;

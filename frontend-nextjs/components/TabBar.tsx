"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

import styled from "styled-components";
import { useSession } from "next-auth/react";
import { formattedDate } from "@/utils/formatDate";
import useCreateDeployment from "@/hooks/useCreateDeployment";
import { authInstance } from "@/lib/authInstance";
import { Github, Link } from "lucide-react";
import { z } from "zod";
import { DeploymentSchema, ProjectSchema } from "@/types/zod-types";
import React, { Dispatch, SetStateAction } from "react";

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardItem = styled.div`
  border: 1px solid #ddd; /* Add your border style */
  border-radius: 0; /* Reset border-radius initially */
  height: 50px;
  background-color: #1d1919;

  &:first-child {
    border-top-left-radius: 4px; /* Adjust the top-left corner radius */
    border-top-right-radius: 4px; /* Adjust the top-right corner radius */
  }

  &:last-child {
    border-bottom-left-radius: 4px; /* Adjust the bottom-left corner radius */
    border-bottom-right-radius: 4px; /* Adjust the bottom-right corner radius */
  }
`;

const TabBarPropTypes = z.object({
  deployments: z.array(DeploymentSchema),
  projectId: z.string(),
  project: ProjectSchema,
  // setLoading: Dispatch<SetStateAction<boolean>>,
  setLoading: z.function().args(z.boolean()),
  projectStatus: z.string(),
});

const TabBar = ({
  deployments,
  projectId,
  project,
  setLoading,
  projectStatus,
}: z.infer<typeof TabBarPropTypes>) => {
  const router = useRouter();
  const session = useSession();
  if (session?.data === null) {
    router.push("/");
  }

  const {
    createDeployment,
    loading,
    data: deploymentData,
  } = useCreateDeployment();

  const handleCreateDeployment = async () => {
    setLoading(true);
    const res = await authInstance.post(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/deploy`,
      {
        projectId,
      },
      { withCredentials: true }
    );
    // await createDeployment(projectId);
    // // console.log(res);
    // console.log(deploymentData, "deploumentdata");
    // const deploymentId = deploymentData?.data?.data?.deploymentId;
    const deploymentId = res?.data?.data?.deploymentId;
    router.push(`/projects/${projectId}/${deploymentId}`);
    setLoading(false);
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="deployments">Deployments</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
      </TabsContent>
      <TabsContent value="overview" className="space-y-4">
        <Card className=" bg-[#151313] w-[800px] m-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex flex-col">
              <CardTitle className="text-2xl font-medium">
                {project?.name}
              </CardTitle>
              <a
                href={`http://${project?.subDomain}.localhost:8000`}
                className="flex gap-2 text-[14px] hover:underline  align-middle mb-2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Link className="w-[14px]" />
                {`${project?.subDomain}.localhost:8000`}
              </a>
            </div>
            <Button className="ml-20" onClick={handleCreateDeployment}>
              Create deployment
            </Button>

            <Button
              onClick={(e) =>
                router.push(
                  `/projects/${project?.id}/${project?.Deployment[0]?.id}`
                )
              }
            >
              See Logs
            </Button>
          </CardHeader>
          <CardContent className="flex items-center justify-between mt-4">
            <div className="flex-col gap-y-4">
              <a
                href={project?.gitURL.replace("git://", "https://")}
                className="flex gap-2 text-[14px] hover:underline  align-middle mb-2 border-2 rounded-full py-1 px-2"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-[14px]" />
                {project?.gitURL.slice(17).replace(/\.git$/, "")}
              </a>

              <p className="text-xs text-muted-foreground">
                {`Last Updated at: ${formattedDate(
                  project?.Deployment[0]?.createdAt
                )}`}
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className=""
              variant={"secondary"}
            >
              <span className="text-xs mr-1"> Current Status:</span>
              <span>{projectStatus}</span>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="deployments" className="space-y-4">
        <Card className="w-[600px] m-auto mt-10">
          <CardHeader>
            <CardTitle>Import your git repository</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardContainer>
              {deployments?.map((deployment) => (
                <CardItem
                  key={deployment?.id}
                  className="flex flex-row justify-around items-center cursor-pointer p-8"
                  onClick={() =>
                    router.push(`/projects/${projectId}/${deployment?.id}`)
                  }
                >
                  <div>{deployment?.id}</div>
                  <Button className="flex-end">View logs</Button>
                </CardItem>
              ))}
            </CardContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TabBar;

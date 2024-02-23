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

const TabBar = ({ deployments, projectId, project, setLoading }) => {
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
        <Button onClick={handleCreateDeployment}>Create deployment</Button>
        <Card className="m-auto mt-10 w-[1000px]  bg-[#151313]  ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[60px] font-medium">
              {project?.name}
            </CardTitle>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setLoading(true);
                router.push(
                  `/projects/${project?.id}/${project?.Deployment[0]?.id}`
                );
              }}
            >
              See Logs
            </Button>
          </CardHeader>
          <CardContent className="flex-col">
            <a
              href={`http://${project?.subDomain}.localhost:8000`}
              className="text-[14px] hover:underline"
              target="_blank" // If you want to open the link in a new tab
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {`${project?.subDomain}.localhost:8000`}
            </a>
            <p>
              <a
                href={project?.gitURL?.replace("git://", "https://")}
                className="text-[14px] hover:underline"
                target="_blank" // If you want to open the link in a new tab
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {project?.gitURL?.slice(17).replace(/\.git$/, "")}
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              {`Last Updated at: ${formattedDate(
                project?.Deployment[0]?.createdAt
              )}`}
            </p>
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

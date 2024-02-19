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

const TabBar = ({ deployments, projectId }) => {
  const router = useRouter();
  const session = useSession();
  if (session?.data === null) {
    router.push("/");
  }

  console.log(deployments);
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
      <TabsContent value="deployments" className="space-y-4">
        <Card className="w-[600px] m-auto mt-10 cursor-pointer">
          <CardHeader>
            <CardTitle>Import your git repository</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardContainer>
              {deployments?.map((deployment) => (
                // <div key={deployment?.id}>{deployments?.id}</div>
                <CardItem
                  key={deployment?.id}
                  className="flex flex-row justify-around items-center"
                  onClick={() =>
                    router.push(`/projects/${projectId}/${deployment?.id}`)
                  }
                >
                  <div>{deployment?.id}</div>
                  <Button
                    // onClick={() => handleImportClick(repo?.gitURL)}
                    className="flex-end"
                  >
                    View logs
                  </Button>
                </CardItem>
              ))}
              {/* {repos?.map((repo) => (
                  <CardItem
                    key={repo?.name}
                    className="flex flex-row justify-around items-center"
                  >
                    <div>{repo?.name}</div>
                    <Button
                      onClick={() => handleImportClick(repo?.gitURL)}
                      className="flex-end"
                    >
                      Import
                    </Button>
                  </CardItem>
                ))} */}
            </CardContainer>
          </CardContent>
          {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default TabBar;

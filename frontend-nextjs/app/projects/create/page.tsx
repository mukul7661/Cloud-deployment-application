"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import styled from "styled-components";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { authInstance } from "@/lib/authInstance";
import { X } from "lucide-react";
import useCreateDeployment from "@/hooks/useCreateDeployment";
import { z } from "zod";
import { ProjectSchema, Repo } from "@/types/zod-types";

const RepoCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RepoCardItem = styled.div`
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

const CreateProjectResponseSchema = z.object({
  data: z.object({
    project: ProjectSchema.extend({
      Deployment: z.undefined(),
    }),
  }),
});

const CreateDeploymentResponseSchema = z.object({
  data: z.object({
    data: z.object({ deploymentId: z.string() }),
  }),
});

const FetchGitUrlsResponseSchema = z.object({
  data: z.object({
    userReposFiltered: z.array(Repo),
  }),
});

export default function CardWithForm() {
  const { data: session, status } = useSession();

  const router = useRouter();

  console.log(session?.data?.user?.email);
  const [repos, setRepos] = useState<z.infer<typeof Repo>[] | null>(null);
  const [repoURL, setRepoURL] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const {
    createDeployment,

    data: deploymentData,
  } = useCreateDeployment();

  const handleClickDeploy = async () => {
    if (projectName === "") {
      setError("Please enter a project name");
      return;
    }
    const data: z.infer<typeof CreateProjectResponseSchema> =
      await authInstance.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/create`,
        {
          gitURL: repoURL,
          name: projectName,
          email: session?.data?.user?.email,
        },
        { withCredentials: true }
      );
    console.log(data);
    const parsedData = CreateProjectResponseSchema.safeParse(data);
    console.log(parsedData);

    if (!parsedData.success) {
      console.error("Error: ", parsedData.error);
      return;
    }

    console.log(parsedData?.data?.data?.project?.id);

    const projectId = parsedData?.data?.data?.project?.id;

    const res: z.infer<typeof CreateDeploymentResponseSchema> =
      await authInstance.post(
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
  };

  function handleImportClick(url: string) {
    setRepoURL(url);

    setShowConfigModal(true);
  }

  useEffect(() => {
    if (session === null) {
      router.push("/");
    }
    async function fetchGiturls() {
      try {
        if (session?.user?.email) {
          const res: z.infer<typeof FetchGitUrlsResponseSchema> =
            await authInstance.get(
              `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/user-repos?email=${session?.user?.email}`,
              {
                headers: {
                  "Content-Type": "application/json",
                },
                withCredentials: true,
              }
            );

          console.log(res);

          const parsedResponse = FetchGitUrlsResponseSchema.safeParse(res);

          if (!parsedResponse?.success) {
            console.error("Error: ", parsedResponse?.error);

            return;
          }
          setRepos(parsedResponse?.data?.data?.userReposFiltered);
          setLoading(false);
        }
      } catch (err) {
        console.log("Error: ", err);
      }
    }
    fetchGiturls();
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
          <Card className="w-[600px] m-auto mt-10">
            <CardHeader>
              <CardTitle>Import your git repository</CardTitle>
              <CardDescription>
                Deploy your new project in one-click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RepoCardContainer>
                {repos?.map((repo: z.infer<typeof Repo>) => (
                  <RepoCardItem
                    key={repo?.name}
                    className="flex flex-row justify-around items-center p-8"
                  >
                    <div className="w-[250px]">{repo?.name}</div>
                    <Button
                      onClick={() => handleImportClick(repo?.gitURL)}
                      className="flex-end "
                    >
                      Import
                    </Button>
                  </RepoCardItem>
                ))}
              </RepoCardContainer>
            </CardContent>
          </Card>
          {showConfigModal && (
            <Dialog open={showConfigModal}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogClose
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    onClick={() => setShowConfigModal(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                  <DialogTitle>Deploy</DialogTitle>
                  <DialogDescription>
                    Deploy your project in one click{" "}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      type="text"
                      placeholder="Project name"
                      className="col-span-3"
                    />
                    <div></div>
                    <div className="text-xs text-[#c08484] w-full col-span-3 ml-2">
                      {error}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleClickDeploy} type="submit">
                    Deploy
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import styled from "styled-components";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

export default function CardWithForm() {
  const session = useSession();
  const router = useRouter();

  if (session?.data === null) {
    router.push("/");
  }

  console.log(session?.data?.user?.email);
  const [repos, setRepos] = useState([]);
  const [repoURL, setRepoURL] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  const handleClickDeploy = useCallback(async () => {
    console.log(repoURL);
    const { data } = await axios.post(
      `http://${process.env.NEXT_PUBLIC_API_SERVER_URL}:9000/api/project/create`,
      {
        gitURL: repoURL,
        name: projectName,
        email: session?.data?.user?.email,
      },
      { withCredentials: true }
    );

    console.log(data?.data?.project?.id);

    const projectId = data?.data?.project?.id;

    const res = await axios.post(
      `http://${process.env.NEXT_PUBLIC_API_SERVER_URL}:9000/api/project/deploy`,
      {
        projectId,
      },
      { withCredentials: true }
    );
    console.log(res);

    const deploymentId = res?.data?.data?.deploymentId;
    router.push(`/projects/${projectId}/${deploymentId}`);

    // if (data && data.data) {
    //   const { projectSlug, url } = data.data;
    //   setProjectId(projectSlug);
    //   setDeployPreviewURL(url);

    //   console.log(`Subscribing to logs:${projectSlug}`);
    //   socket.emit("subscribe", `logs:${projectSlug}`);
    // }
  }, [projectName, repoURL]);

  function handleImportClick(url: string) {
    setRepoURL(url);

    setShowConfigModal(true);
  }

  useEffect(() => {
    async function fetchGiturls() {
      try {
        if (session?.data?.user?.email) {
          const res = await axios.get(
            `http://${process.env.NEXT_PUBLIC_API_SERVER_URL}:9000/api/project/user-repos?email=${session?.data?.user?.email}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );

          console.log(res);
          setRepos(res?.data?.userReposFiltered);
        }
      } catch (err) {
        console.log("Error: ", err);
      }
    }
    fetchGiturls();
  }, [session?.data?.user?.email]);

  return (
    <>
      <Card className="w-[600px] m-auto mt-10">
        <CardHeader>
          <CardTitle>Import your git repository</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                  </SelectTrigger>
                <SelectContent position="popper">
                <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                  </SelectContent>
              </Select>
              </div>
              </div>
            </form> */}
          <RepoCardContainer>
            {repos?.map((repo) => (
              <RepoCardItem
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
              </RepoCardItem>
            ))}
          </RepoCardContainer>
        </CardContent>
        {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
      </Card>
      {showConfigModal && (
        <Dialog open={showConfigModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogClose onClick={() => setShowConfigModal(false)} />
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
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClickDeploy} type="submit">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

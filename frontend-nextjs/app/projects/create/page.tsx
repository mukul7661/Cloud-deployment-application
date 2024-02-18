// "use client";

// import { useEffect, useState } from "react";

// async function fetchGiturls() {
//   return [{ name: "mukul7661/vercel-clone" }];
// }

// export default function CreateProject() {
//   const [gitUrls, setGitUrls] = useState(null);
//   useEffect(() => {
//     const getUrls = async () => {
//       const gitUrls = await fetchGiturls();
//       setGitUrls(gitUrls);
//     };
//     getUrls();
//   }, []);
//   console.log(gitUrls);
//   return (
//     <>
//       {gitUrls?.map((gitUrl) => (
//         <div key={gitUrl}>{gitUrl?.name}</div>
//       ))}
//     </>
//   );
// }

"use client";

import { useState } from "react";

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
  const [repos, setRepos] = useState([
    { name: "mukul7661/project1" },
    { name: "mukul7661/project2" },
    { name: "mukul7661/project3" },
    { name: "mukul7661/project4" },
  ]);
  return (
    <Card className="w-[600px] m-auto mt-10">
      <CardHeader>
        <CardTitle>Import your git repository</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
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
              <div>mukul7661/project</div>
              <Button className="flex-end">Import</Button>
            </RepoCardItem>
          ))}
        </RepoCardContainer>

        {/* <div className="border border-[#1d1919]">mukul7661/project</div> */}
      </CardContent>
      {/* <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter> */}
    </Card>
  );
}

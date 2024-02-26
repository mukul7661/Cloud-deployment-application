"use client";

import { signIn, useSession } from "next-auth/react";
import { MainNav } from "./ui/main-nav";
import { UserNav } from "./ui/user-nav";
import { Button } from "./ui/button";

const Navbar = () => {
  const { data: session, status } = useSession();
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {!(status === "loading") && (
          <>
            <MainNav className="mx-6" />
            {session && (
              <div className="ml-auto flex items-center space-x-4">
                <UserNav />
              </div>
            )}
            {!session && <Button onClick={() => signIn()}>Sign in</Button>}
          </>
        )}
      </div>
    </div>
  );
};

export { Navbar };

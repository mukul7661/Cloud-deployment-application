"use client";

import { signIn, useSession } from "next-auth/react";
import { MainNav } from "./ui/main-nav";
import { UserNav } from "./ui/user-nav";
import Link from "next/link";
import { Button } from "./ui/button";

const Navbar = () => {
  const session = useSession();
  console.log(session);
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav className="mx-6" />
        {session?.data && (
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        )}
        {!session?.data && <Button onClick={() => signIn()}>Sign in</Button>}
      </div>
    </div>
  );
};

export { Navbar };

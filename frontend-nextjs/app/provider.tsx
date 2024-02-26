"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // useEffect(() => {
  //   document.cookie =
  //     "is-guest=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  // }, []);
  return <SessionProvider>{children}</SessionProvider>;
}

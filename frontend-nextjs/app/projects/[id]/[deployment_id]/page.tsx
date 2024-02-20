"use client";

import { usePathname } from "next/navigation";

const Deployment = () => {
  const path = usePathname();
  const pathArray = path.split("/");
  const deploymentId = pathArray[pathArray.length - 1];
  console.log(deploymentId, "deploymentId");

  return <div>deploymentId</div>;
};

export default Deployment;

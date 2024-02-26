import { authInstance } from "@/lib/authInstance";
import { useState } from "react";

const useCreateProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const createDeployment = async (projectId: string) => {
    try {
      setLoading(true);

      const res = await authInstance.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/create`,
        {
          projectId,
        },
        { withCredentials: true }
      );
      // console.log(res);
      setData(res);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { createDeployment, loading, error, data };
};

export default useCreateProject;

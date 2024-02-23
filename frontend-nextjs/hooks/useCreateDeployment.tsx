// import { authInstance } from "@/lib/authInstance";

// export const useCreateDeployment = async ({ projectId }) => {
//   const res = await authInstance.post(
//     `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/deploy`,
//     {
//       projectId,
//     },
//     { withCredentials: true }
//   );

//   return res;
// };

// useDeployProject.js
import { authInstance } from "@/lib/authInstance";
import { useState } from "react"; // Make sure to import your Axios instance

const useCreateDeployment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const createDeployment = async (projectId) => {
    try {
      setLoading(true);

      const res = await authInstance.post(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/project/deploy`,
        {
          projectId,
        },
        { withCredentials: true }
      );
      console.log(res);
      setData(res);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { createDeployment, loading, error, data };
};

export default useCreateDeployment;

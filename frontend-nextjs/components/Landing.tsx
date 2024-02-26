import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const Landing = ({ setLoading }) => {
  const router = useRouter();
  return (
    <Card className="m-auto mt-10 w-[600px] bg-[#151313]">
      <CardHeader className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-col w-full p-8">
          <CardTitle className="text-xl font-medium flex flex-col gap-6">
            <div className="flex flex-col">
              <span>Sign in for all features like</span>
              <span className="text-base text-[#8c8181]">• Persitent Logs</span>
              <span className="text-base text-[#8c8181]">
                • Import/Sync with Github
              </span>
              <span className="text-base text-[#8c8181]">
                • Complete history of Deployments
              </span>
            </div>
            <div className="flex flex-col">
              <span>We are using Cutting edge technologies like</span>
              <span className="text-base text-[#8c8181]">
                • Kafka as message broker
              </span>
              <span className="text-base text-[#8c8181]">
                • Docker and AWS ECS for relaible building of your projects
              </span>
              <span className="text-base text-[#8c8181]">
                • S3, Postgres and Clickhouse for data storage
              </span>
            </div>
            <div className="flex flex-col">
              <span>What's coming next?</span>
              <span className="text-base text-[#8c8181]">
                • Automatic deployments on commit or PR to main branch
              </span>
              <span className="text-base text-[#8c8181]">
                • Custom configuration options
              </span>
              <span className="text-base text-[#8c8181]">
                • Rollback feature in deployments
              </span>
              <span className="text-base text-[#8c8181]">
                • Prod, Dev, Test, Staging environments
              </span>
            </div>

            <div className="flex gap-8 mt-10">
              <Button
                onClick={() => {
                  setLoading(true);
                  signIn();
                }}
                className="w-full"
              >
                Sign in
              </Button>
              <Button
                onClick={() => {
                  setLoading(true);
                  router.push("/projects/guest");
                }}
                className="w-full"
              >
                Deploy as guest
              </Button>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
};

export { Landing };

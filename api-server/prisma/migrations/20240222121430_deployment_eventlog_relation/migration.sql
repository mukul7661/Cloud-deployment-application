/*
  Warnings:

  - The values [NOT_STARTED,FAIL] on the enum `DeploymentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeploymentStatus_new" AS ENUM ('QUEUED', 'IN_PROGRESS', 'READY', 'FAILED');
ALTER TABLE "Deployment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Deployment" ALTER COLUMN "status" TYPE "DeploymentStatus_new" USING ("status"::text::"DeploymentStatus_new");
ALTER TYPE "DeploymentStatus" RENAME TO "DeploymentStatus_old";
ALTER TYPE "DeploymentStatus_new" RENAME TO "DeploymentStatus";
DROP TYPE "DeploymentStatus_old";
ALTER TABLE "Deployment" ALTER COLUMN "status" SET DEFAULT 'QUEUED';
COMMIT;

-- AlterTable
ALTER TABLE "Deployment" ALTER COLUMN "status" SET DEFAULT 'QUEUED';

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "Deployment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

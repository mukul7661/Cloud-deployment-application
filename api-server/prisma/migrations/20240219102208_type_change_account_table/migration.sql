/*
  Warnings:

  - A unique constraint covering the columns `[access_token]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Account_access_token_key" ON "Account"("access_token");

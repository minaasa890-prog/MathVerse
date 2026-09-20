/*
  Warnings:

  - A unique constraint covering the columns `[studentId,questionId,examId]` on the table `Attempt` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `examId` to the `Attempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "examId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_studentId_questionId_examId_key" ON "Attempt"("studentId", "questionId", "examId");

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

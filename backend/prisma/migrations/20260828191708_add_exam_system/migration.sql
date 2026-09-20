/*
  Warnings:

  - You are about to drop the `Reward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkillProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StudentProfile" DROP CONSTRAINT "StudentProfile_userId_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "correctAnswer" TEXT,
ADD COLUMN     "optionA" TEXT,
ADD COLUMN     "optionB" TEXT,
ADD COLUMN     "optionC" TEXT,
ADD COLUMN     "optionD" TEXT,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "Reward";

-- DropTable
DROP TABLE "SkillProgress";

-- DropTable
DROP TABLE "StudentProfile";

-- CreateTable
CREATE TABLE "Exam" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "classroomId" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamQuestion" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

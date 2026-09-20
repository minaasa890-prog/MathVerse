-- AlterTable
ALTER TABLE "PracticeSession" ADD COLUMN     "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "totalQuestions" DROP DEFAULT;

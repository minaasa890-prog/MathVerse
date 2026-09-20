-- AlterTable
ALTER TABLE "PracticeSession" ADD COLUMN     "chapter" TEXT,
ADD COLUMN     "difficulty" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "subject" TEXT NOT NULL DEFAULT 'Math';

-- CreateTable
CREATE TABLE "PracticeAnswer" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answer" TEXT,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PracticeAnswer" ADD CONSTRAINT "PracticeAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PracticeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeAnswer" ADD CONSTRAINT "PracticeAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

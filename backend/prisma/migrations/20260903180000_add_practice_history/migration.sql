-- CreateTable
CREATE TABLE "PracticeHistory" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PracticeHistory" ADD CONSTRAINT "PracticeHistory_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeHistory" ADD CONSTRAINT "PracticeHistory_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
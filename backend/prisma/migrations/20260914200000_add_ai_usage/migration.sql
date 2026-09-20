CREATE TABLE "AIUsage" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "dateKey" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AIUsage_studentId_dateKey_key"
ON "AIUsage"("studentId", "dateKey");

CREATE INDEX "AIUsage_studentId_idx"
ON "AIUsage"("studentId");

CREATE INDEX "AIUsage_dateKey_idx"
ON "AIUsage"("dateKey");

ALTER TABLE "AIUsage"
ADD CONSTRAINT "AIUsage_studentId_fkey"
FOREIGN KEY ("studentId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
-- CreateTable
CREATE TABLE "XPTransaction" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "referenceKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XPTransaction_referenceKey_key"
ON "XPTransaction"("referenceKey");

-- CreateIndex
CREATE INDEX "XPTransaction_studentId_idx"
ON "XPTransaction"("studentId");

-- CreateIndex
CREATE INDEX "XPTransaction_source_idx"
ON "XPTransaction"("source");

-- AddForeignKey
ALTER TABLE "XPTransaction"
ADD CONSTRAINT "XPTransaction_studentId_fkey"
FOREIGN KEY ("studentId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
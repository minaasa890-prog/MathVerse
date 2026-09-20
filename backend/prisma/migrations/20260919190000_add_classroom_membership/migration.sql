-- CreateTable
CREATE TABLE "ClassroomMembership" (
    "id" SERIAL NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassroomMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassroomMembership_classroomId_idx" ON "ClassroomMembership"("classroomId");

-- CreateIndex
CREATE INDEX "ClassroomMembership_studentId_idx" ON "ClassroomMembership"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomMembership_classroomId_studentId_key" ON "ClassroomMembership"("classroomId", "studentId");

-- AddForeignKey
ALTER TABLE "ClassroomMembership"
ADD CONSTRAINT "ClassroomMembership_classroomId_fkey"
FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMembership"
ADD CONSTRAINT "ClassroomMembership_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
-- CreateTable
CREATE TABLE "IngestKey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "publicId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "keyhash" TEXT NOT NULL,
    "lastUsedAt" DATETIME,
    "expiresAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IngestKey_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "IngestKey_publicId_key" ON "IngestKey"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "IngestKey_keyhash_key" ON "IngestKey"("keyhash");

-- CreateIndex
CREATE UNIQUE INDEX "IngestKey_projectId_name_key" ON "IngestKey"("projectId", "name");

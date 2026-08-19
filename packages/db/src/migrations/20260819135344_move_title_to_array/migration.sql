-- CreateTable
CREATE TABLE "SpecTestTitlePart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "specTestId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "SpecTestTitlePart_specTestId_fkey" FOREIGN KEY ("specTestId") REFERENCES "SpecTest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate existing data from SpecTest.title to SpecTestTitlePart
INSERT INTO "SpecTestTitlePart" ("specTestId", "position", "value")
SELECT "id", 0, "title"
FROM "SpecTest";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpecTest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "specId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "message" TEXT,
    "trace" TEXT,
    CONSTRAINT "SpecTest_specId_fkey" FOREIGN KEY ("specId") REFERENCES "Spec" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SpecTest" ("duration", "id", "message", "specId", "status", "trace") SELECT "duration", "id", "message", "specId", "status", "trace" FROM "SpecTest";
DROP TABLE "SpecTest";
ALTER TABLE "new_SpecTest" RENAME TO "SpecTest";
CREATE INDEX "SpecTest_specId_idx" ON "SpecTest"("specId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SpecTestTitlePart_position_value_idx" ON "SpecTestTitlePart"("position", "value");

-- CreateIndex
CREATE INDEX "SpecTestTitlePart_value_idx" ON "SpecTestTitlePart"("value");

-- CreateIndex
CREATE UNIQUE INDEX "SpecTestTitlePart_specTestId_position_key" ON "SpecTestTitlePart"("specTestId", "position");

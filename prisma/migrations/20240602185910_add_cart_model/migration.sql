-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActiveCart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ActiveCart" ("createdAt", "id", "sessionId", "totalAmount", "updatedAt", "userId") SELECT "createdAt", "id", "sessionId", "totalAmount", "updatedAt", "userId" FROM "ActiveCart";
DROP TABLE "ActiveCart";
ALTER TABLE "new_ActiveCart" RENAME TO "ActiveCart";
CREATE UNIQUE INDEX "ActiveCart_userId_sessionId_key" ON "ActiveCart"("userId", "sessionId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

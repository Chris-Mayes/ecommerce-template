-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ArchivedCart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "archivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ArchivedCart" ("archivedAt", "createdAt", "id", "totalAmount", "userId") SELECT "archivedAt", "createdAt", "id", "totalAmount", "userId" FROM "ArchivedCart";
DROP TABLE "ArchivedCart";
ALTER TABLE "new_ArchivedCart" RENAME TO "ArchivedCart";
CREATE UNIQUE INDEX "ArchivedCart_userId_sessionId_key" ON "ArchivedCart"("userId", "sessionId");
CREATE TABLE "new_ActiveCart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT,
    "totalAmount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ActiveCart" ("createdAt", "id", "totalAmount", "updatedAt", "userId") SELECT "createdAt", "id", "totalAmount", "updatedAt", "userId" FROM "ActiveCart";
DROP TABLE "ActiveCart";
ALTER TABLE "new_ActiveCart" RENAME TO "ActiveCart";
CREATE UNIQUE INDEX "ActiveCart_userId_sessionId_key" ON "ActiveCart"("userId", "sessionId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

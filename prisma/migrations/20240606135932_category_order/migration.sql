-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GlobalCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_GlobalCategory" ("id", "name") SELECT "id", "name" FROM "GlobalCategory";
DROP TABLE "GlobalCategory";
ALTER TABLE "new_GlobalCategory" RENAME TO "GlobalCategory";
CREATE UNIQUE INDEX "GlobalCategory_name_key" ON "GlobalCategory"("name");
PRAGMA foreign_key_check("GlobalCategory");
PRAGMA foreign_keys=ON;

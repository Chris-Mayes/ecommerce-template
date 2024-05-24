-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConfiguredProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "purchasequantity" INTEGER NOT NULL DEFAULT 1,
    "Colour" TEXT NOT NULL DEFAULT '',
    "productId" TEXT NOT NULL,
    CONSTRAINT "ConfiguredProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ConfiguredProduct" ("createdAt", "id", "productId", "purchasequantity", "updatedAt") SELECT "createdAt", "id", "productId", "purchasequantity", "updatedAt" FROM "ConfiguredProduct";
DROP TABLE "ConfiguredProduct";
ALTER TABLE "new_ConfiguredProduct" RENAME TO "ConfiguredProduct";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceInPence" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isAvailableForPurchase" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "availablequantity" INTEGER NOT NULL
);
INSERT INTO "new_Product" ("availablequantity", "createdAt", "description", "filePath", "id", "imagePath", "isAvailableForPurchase", "name", "priceInPence", "updatedAt") SELECT "availablequantity", "createdAt", "description", "filePath", "id", "imagePath", "isAvailableForPurchase", "name", "priceInPence", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

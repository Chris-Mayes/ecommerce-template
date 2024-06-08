-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceInPence" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "lengthInMm" INTEGER,
    "widthInMm" INTEGER,
    "heightInMm" INTEGER,
    "isAvailableForPurchase" BOOLEAN NOT NULL DEFAULT true,
    "availableQuantity" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("availableQuantity", "createdAt", "description", "filePath", "heightInMm", "id", "isAvailableForPurchase", "lengthInMm", "name", "priceInPence", "updatedAt", "widthInMm") SELECT "availableQuantity", "createdAt", "description", "filePath", "heightInMm", "id", "isAvailableForPurchase", "lengthInMm", "name", "priceInPence", "updatedAt", "widthInMm" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check("Product");
PRAGMA foreign_keys=ON;

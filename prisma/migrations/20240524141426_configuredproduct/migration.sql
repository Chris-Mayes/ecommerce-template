-- CreateTable
CREATE TABLE "ConfiguredProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "purchasequantity" INTEGER NOT NULL DEFAULT 1,
    "productId" TEXT NOT NULL,
    CONSTRAINT "ConfiguredProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

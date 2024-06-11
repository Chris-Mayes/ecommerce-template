import db from "@/db/db";
import { PageHeader } from "../../../_components/PageHeader";
import { ProductForm } from "../../_components/ProductForm";

export default async function EditProductPage({
    params: { id },
}: {
    params: { id: string };
}) {
    const product = await db.product.findUnique({
        where: { id },
        include: {
            colours: { include: { globalColour: true } },
            images: true,
            categories: { include: { globalCategory: true } },
        },
    });

    const productWithColoursAndCategories = product
        ? {
              ...product,
              colours: product.colours.map((c) => ({
                  id: c.id,
                  globalColour: {
                      id: c.globalColour.id,
                      name: c.globalColour.name,
                  },
              })),
              categories: product.categories.map((c) => ({
                  id: c.id,
                  globalCategory: {
                      id: c.globalCategory.id,
                      name: c.globalCategory.name,
                  },
              })),
              images: product.images.map((i) => ({
                  id: i.id,
                  url: i.url,
                  productId: i.productId,
              })),
          }
        : null;

    return (
        <>
            <PageHeader>Edit Product</PageHeader>
            <ProductForm product={productWithColoursAndCategories} />
        </>
    );
}

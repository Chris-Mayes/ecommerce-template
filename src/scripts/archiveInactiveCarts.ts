import db from "../db/db";

async function archiveInactiveCarts() {
    const inactiveCarts = await db.activeCart.findMany({
        where: {
            updatedAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
            },
            isArchived: false,
        },
        include: {
            items: true,
        },
    });

    for (const cart of inactiveCarts) {
        await db.$transaction(async (prisma) => {
            const archivedCart = await prisma.archivedCart.create({
                data: {
                    userId: cart.userId,
                    sessionId: cart.sessionId,
                    totalAmount: cart.totalAmount,
                    createdAt: cart.createdAt,
                    archivedAt: new Date(),
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            colour: item.colour,
                            price: item.price,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt,
                        })),
                    },
                },
            });

            await prisma.activeCart.update({
                where: { id: cart.id },
                data: { isArchived: true },
            });
        });
    }

    console.log(`Archived ${inactiveCarts.length} inactive carts.`);
}

archiveInactiveCarts()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** 订单查询复用：商品项 + 产品摘要 */
export const orderWithItemsInclude = {
  items: {
    include: {
      product: {
        select: { id: true, name: true, images: true, slug: true },
      },
    },
  },
} as const;

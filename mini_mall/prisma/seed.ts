import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始创建种子数据...");

  // --- 用户 ---
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      email: "admin@minimall.com",
      name: "管理员",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("  ✓ 管理员账号: admin@minimall.com / admin123");

  const customerPassword = await bcrypt.hash("customer123", 12);
  await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      email: "customer@test.com",
      name: "测试用户",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });
  console.log("  ✓ 测试用户: customer@test.com / customer123");

  // --- 分类 ---
  const categories = [
    { name: "电子产品", slug: "electronics", description: "数码设备、配件及电子周边" },
    { name: "服装鞋帽", slug: "clothing", description: "服饰、鞋靴及潮流配饰" },
    { name: "家居生活", slug: "home-garden", description: "家居装饰、收纳及生活用品" },
    { name: "图书音像", slug: "books", description: "图书、电子书及音像制品" },
    { name: "运动户外", slug: "sports", description: "运动器材、户外装备及健身用品" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("  ✓ 5 个商品分类");

  // --- 商品 ---
  const allCategories = await prisma.category.findMany();
  const catMap = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]));

  const products = [
    {
      name: "无线蓝牙耳机",
      slug: "wireless-bluetooth-headphones",
      description: "高品质主动降噪蓝牙耳机，续航 30 小时，支持快充。佩戴舒适，音质出色，是日常通勤和运动的最佳伴侣。",
      price: 299.00,
      comparePrice: 499.00,
      stock: 45,
      isFeatured: true,
      categoryId: catMap.electronics,
    },
    {
      name: "USB-C 七合一扩展坞",
      slug: "usb-c-hub-7-in-1",
      description: "Type-C 接口扩展坞，含 HDMI 4K输出、USB-A ×3、SD/TF 卡槽，轻薄笔记本必备。",
      price: 129.00,
      stock: 100,
      isFeatured: true,
      categoryId: catMap.electronics,
    },
    {
      name: "机械键盘 87键",
      slug: "mechanical-keyboard-87",
      description: "Cherry 青轴机械键盘，87 键紧凑布局，RGB 背光，全键无冲，办公游戏两相宜。",
      price: 359.00,
      comparePrice: 459.00,
      stock: 30,
      categoryId: catMap.electronics,
    },
    {
      name: "纯棉圆领 T 恤",
      slug: "cotton-crew-neck-tshirt",
      description: "100% 有机棉，亲肤透气。经典版型，多色可选，四季百搭基础款。",
      price: 79.00,
      comparePrice: 129.00,
      stock: 200,
      isFeatured: true,
      categoryId: catMap.clothing,
    },
    {
      name: "经典牛仔夹克",
      slug: "denim-jacket",
      description: "复古水洗牛仔夹克，纯棉面料，修身剪裁。春秋外搭首选，型男必备。",
      price: 299.00,
      stock: 30,
      categoryId: catMap.clothing,
    },
    {
      name: "轻量跑鞋",
      slug: "lightweight-running-shoes",
      description: "飞织鞋面 + EVA 中底，单只仅重 200g。缓震回弹，适合日常慢跑和健身训练。",
      price: 259.00,
      comparePrice: 399.00,
      stock: 50,
      categoryId: catMap.clothing,
    },
    {
      name: "室内香薰蜡烛套装",
      slug: "scented-candle-set",
      description: "手工大豆蜡蜡烛 4 只装：薰衣草、香草、柑橘、松木。舒缓身心，营造温馨氛围。",
      price: 89.00,
      stock: 60,
      isFeatured: true,
      categoryId: catMap["home-garden"],
    },
    {
      name: "北欧风台灯",
      slug: "nordic-table-lamp",
      description: "简约北欧设计台灯，三档调光，护眼 LED 光源。书房、卧室、客厅皆适用。",
      price: 169.00,
      comparePrice: 229.00,
      stock: 25,
      categoryId: catMap["home-garden"],
    },
    {
      name: "JavaScript 高级程序设计（第4版）",
      slug: "js-elevation-4th",
      description: "前端开发者必读的「红宝书」，全面覆盖 ECMAScript 2020+，从入门到精通的进阶指南。",
      price: 89.00,
      stock: 20,
      categoryId: catMap.books,
    },
    {
      name: "高性能瑜伽垫",
      slug: "premium-yoga-mat",
      description: "6mm 加厚防滑瑜伽垫，TPE 环保材质，配绑带。居家健身、瑜伽冥想必备。",
      price: 129.00,
      comparePrice: 179.00,
      stock: 35,
      categoryId: catMap.sports,
    },
    {
      name: "不锈钢保温杯 500ml",
      slug: "insulated-water-bottle-500",
      description: "316 不锈钢内胆，12 小时保温/保冷。轻量便携，办公室户外皆适用。",
      price: 99.00,
      stock: 80,
      categoryId: catMap["home-garden"],
    },
    {
      name: "无线充电板",
      slug: "wireless-charging-pad",
      description: "15W 快充无线充电器，兼容 iPhone/Android/耳机。轻薄设计，即放即充。",
      price: 69.00,
      comparePrice: 99.00,
      stock: 60,
      categoryId: catMap.electronics,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        images: JSON.stringify(["/images/placeholder.svg"]),
        isPublished: true,
      },
    });
  }
  console.log(`  ✓ ${products.length} 件商品`);

  console.log("\n✅ 种子数据创建完成！");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ 种子数据创建失败:", e);
    prisma.$disconnect();
    process.exit(1);
  });

import { faker } from "@faker-js/faker";
import { db } from "../src/db/index.ts";
import { products } from "../src/db/schema.ts";

const categories = [
  "Electronics",
  "Apparel",
  "Home & Kitchen",
  "Books",
  "Toys",
  "Sports",
  "Beauty",
  "Grocery",
];

const statuses = ["available", "out_of_stock", "discontinued"] as const;

async function seed() {
  console.log("Seeding products…");

  await db.delete(products);

  const rows = Array.from({ length: 60 }, () => ({
    name: faker.commerce.productName(),
    category: faker.helpers.arrayElement(categories),
    price: Number.parseFloat(faker.commerce.price({ min: 5, max: 900 })),
    stock: faker.number.int({ min: 0, max: 500 }),
    status: faker.helpers.arrayElement(statuses),
    sku: faker.string.alphanumeric({ length: 8, casing: "upper" }),
    description: faker.commerce.productDescription(),
  }));

  await db.insert(products).values(rows);

  console.log(`✓ Inserted ${rows.length} products.`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

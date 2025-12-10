require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB } = require("../src/config/db");
const { Product } = require("../src/models/Product");
const { Commerce } = require("../src/models/Commerce");

async function main() {
  await connectDB();

  const COMMERCE_ID = "6938cf7032e17cf0a832c805";

  const comercio = await Commerce.findById(COMMERCE_ID);

  if (!comercio) {
    console.error("❌ No se encontró el comercio con ese ID.");
    process.exit(1);
  }

  console.log("🏪 Comercio encontrado:", comercio.nombre);

  const productos = [
    {
      nombre: "Hamburguesa Clásica",
      descripcion: "Hamburguesa con carne, queso y papas",
      precio: 250,
      categoria: "Comida Rápida",
    },
    {
      nombre: "Pizza Personal",
      descripcion: "Pizza de pepperoni personal",
      precio: 350,
      categoria: "Comida Rápida",
    },
    {
      nombre: "Refresco 2L",
      descripcion: "Refresco frío de 2 litros",
      precio: 150,
      categoria: "Bebidas",
    },
    {
      nombre: "Papas Fritas",
      descripcion: "Papas crujientes",
      precio: 120,
      categoria: "Comida Rápida",
    },
  ];

  for (const producto of productos) {
    const existe = await Product.findOne({
      nombre: producto.nombre,
      comercio: COMMERCE_ID,
    });

    if (existe) {
      console.log(`⚠️ Ya existe el producto: ${producto.nombre}`);
      continue;
    }

    await Product.create({
      ...producto,
      comercio: COMMERCE_ID,
      activo: true,
    });

    console.log(`✅ Producto creado: ${producto.nombre}`);
  }

  console.log("\n🎉 Productos de prueba insertados correctamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error insertando productos:", err);
  process.exit(1);
});

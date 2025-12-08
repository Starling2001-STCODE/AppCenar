require("dotenv").config();

const { connectDB } = require("../src/config/db");
const { CommerceType } = require("../src/models/CommerceType");

function createSlug(texto) {
  return texto
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");
}

async function main() {
  await connectDB();

  const tipos = [
    "Comida Rápida",
    "Supermercado",
    "Farmacia",
    "Bebidas y Licores",
    "Repostería",
  ];

  for (const nombre of tipos) {
    const slug = createSlug(nombre);

    const existe = await CommerceType.findOne({ slug });

    if (existe) {
      console.log(`⚠️ Ya existe el tipo de comercio: ${nombre}`);
      continue;
    }

    await CommerceType.create({
      nombre,
      slug,
      activo: true,
    });

    console.log(`✅ Tipo creado: ${nombre}`);
  }

  console.log("\n🎉 Inserción de tipos de comercio completada.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error creando tipos de comercio:", err);
  process.exit(1);
});

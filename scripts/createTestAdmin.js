require("dotenv").config();

const bcrypt = require("bcryptjs");
const { connectDB } = require("../src/config/db");
const { User } = require("../src/models/User");

async function main() {
  await connectDB();

  const plainPassword = "Admin123!";

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const existing = await User.findOne({ username: "admin" });

  if (existing) {
    console.log("Ya existe un usuario con username 'admin'");
    console.log("Puedes usar:");
    console.log("Usuario/correo: admin / admin@appcenar.test");
    console.log("Contraseña: Admin123!");
    process.exit(0);
  }

  const user = await User.create({
    nombre: "Admin",
    apellido: "AppCenar",
    telefono: "8090000000",
    username: "admin",
    email: "admin@appcenar.test",
    passwordHash,
    rol: "admin",
    activo: true,
  });

  console.log("Usuario admin creado correctamente:");
  console.log("Usuario/correo:", user.username, "/", user.email);
  console.log("Contraseña: Admin123!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creando usuario admin:", err);
  process.exit(1);
});

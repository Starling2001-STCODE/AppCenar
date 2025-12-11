AppCenar🌟 Objetivo GeneralCrear una aplicación completa para la gestión de pedidos de delivery a comercios, implementando una arquitectura Modelo-Vista-Controlador (MVC) utilizando Node.js con Express.js.
🛠️ Tecnologías ClaveBackend: Node.js, Express.jsArquitectura: MVCBase de Datos: MongoDB, Autenticación: JWT
Funcionalidades Generales
El sistema está diseñado para manejar cuatro roles distintos con flujos de trabajo específicos: Cliente, Delivery, Comercio, y Administrador.
🔑 Autenticación y RegistroLogin: Acceso mediante correo/nombre de usuario y contraseña. Redirección automática al Home según el rol si el usuario ya está logueado.
Registro (Diferenciado):Cliente/Delivery: Formulario con datos personales, selección de rol, foto de perfil, y activación de cuenta mediante email (token).
Comercio: Formulario con datos del comercio (Nombre, Logo, Horario, Tipo de Comercio) y activación de cuenta mediante email (token).
Restablecimiento de Contraseña: Generación de un token único enviado por correo para acceder a una pantalla de cambio de contraseña.
Estado Inactivo: Los usuarios recién creados están inactivos hasta que confirmen su cuenta por correo, impidiendo el inicio de sesión.
👤 Funcionalidades por Rol
RolFlujo Principal
Mantenimientos y PerfilCliente
Explorar tipos de comercios $\rightarrow$ Listar comercios por tipo $\rightarrow$ Catálogo de productos (selección y carrito) $\rightarrow$ Checkout (selección de dirección, cálculo de ITBIS) $\rightarrow$ Creación de pedido.Perfil (edición de datos), Mis Pedidos (listado y detalle), Mis Direcciones (CRUD), Mis Favoritos (listado de comercios).ComercioHome: Listado de pedidos (más reciente a más antiguo). $\rightarrow$ Detalle de pedido (asignación de Delivery si el estado es Pendiente).Perfil (edición de logo, horarios, contacto), Mantenimiento de Categorías (CRUD), Mantenimiento de Productos (CRUD).DeliveryHome: Listado de pedidos asignados (estado En Proceso). $\rightarrow$ Detalle de pedido (visualización de dirección, botón Completar Pedido).Perfil (edición de datos). Manejo de estados: Disponible (sin pedidos asignados) y Ocupado (con un pedido En Proceso).AdministradorDashboard: Indicadores clave (pedidos, usuarios activos/inactivos, productos).Listado de Clientes/Delivery/Comercios (activación/inactivación), Mantenimiento de Configuración (ej: valor del ITBIS), Mantenimiento de Administradores (CRUD), Mantenimiento de Tipo de Comercios (CRUD).🛒 Flujo de Pedido (Cliente)Catálogo: Productos listados por categoría. Carrito en panel lateral (solo 1 unidad por producto).Continuar: Navegación a la pantalla de Checkout.Checkout:Selección de una dirección de entrega.Cálculo del Total: $\text{Subtotal} + (\text{Subtotal} \times \frac{\text{ITBIS}}{100})$.Botón Pedir para crear el pedido en estado Pendiente.💼 Flujo de Pedido (Comercio/Delivery)Comercio (Detalle del Pedido): Si está Pendiente, el comercio tiene la opción de Asignar Delivery.Asignación: El sistema busca un delivery Disponible y se lo asigna.Cambio de Estado: El pedido pasa a En Proceso. El delivery pasa a Ocupado.Delivery (Detalle del Pedido): Si está En Proceso, el delivery ve la dirección de entrega y tiene el botón Completar Pedido.Completar: El pedido pasa a Completado. El delivery pasa a Disponible.📂 Estructura del ProyectoSe recomienda la siguiente estructura para una arquitectura MVC con Node.js/Express:AppCenar/
├── app/
│   ├── controllers/    # Lógica de las rutas (Manejo de peticiones)
│   ├── models/         # Definición de la estructura de datos (Esquemas de la BD)
│   └── views/          # Plantillas para la interfaz de usuario (Vistas)
├── config/             # Archivos de configuración (BD, servidor, etc.)
├── middleware/         # Lógica de validación, autenticación, permisos (ej: checkRole)
├── public/             # Archivos estáticos (CSS, JS del cliente, Imágenes)
├── routes/             # Definición de las rutas del API (Ej: /cliente, /comercio)
└── server.js           # Punto de entrada principal (Inicialización de Express)
🚀 Instalación y EjecuciónRequisitosNode.js (versión 18+)[Mencionar la BD y cómo se inicia (ej: Docker, local)]PasosClonar el repositorio:Bashgit clone https://aws.amazon.com/es/what-is/repo/
cd AppCenar
Instalar dependencias:Bashnpm install
Configurar variables de entorno:Crea un archivo .env en la raíz del proyecto con las siguientes variables (ejemplo):Fragmento de códigoPORT=3000
DB_URI=https://support.microsoft.com/es-es/office/agregar-una-conexi%C3%B3n-de-datos-a-una-base-de-datos-de-microsoft-sql-server-c26193cc-8520-4941-adec-1df637bbf03a
JWT_SECRET=[Tu clave secreta para tokens]
ITBIS_RATE=18 # Tasa inicial de ITBIS
EMAIL_USER=[Usuario de correo para envíos]
EMAIL_PASS=[Contraseña de correo para envíos]
Ejecutar el servidor:Bashnpm start # o nodemon si lo tienes instalado
El servidor estará corriendo en http://localhost:3000.

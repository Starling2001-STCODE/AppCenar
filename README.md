# Documentación Técnica API Apptiva Backend

---

## Índice de Endpoints

1. [Direcciones - Países](#1-direcciones---paises)
2. [Direcciones - Provincias](#2-direcciones---provincias)
3. [Direcciones - Ciudades](#3-direcciones---ciudades)
4. [Contexto de Activación](#4-contexto-de-activación)
5. [Validación de SIM](#5-validación-de-sim)
6. [Validación de IMEI / Equipo](#6-validación-de-imei--equipo)
7. [Creación de Prospecto / Cliente](#7-creación-de-prospecto--cliente)
8. [Firma de Contrato](#8-firma-de-contrato)

---

## 1. Direcciones - Países

### Descripción
Recupera el listado de países disponibles desde el catálogo maestro del sistema (fuente: `OMEGA.CNF_CATALOGO` con entidad `PAIS`). Utilizado por el frontend para poblar el selector de país, con República Dominicana seleccionado por defecto.

### Método HTTP
**GET**

### URL
```
GET /address/countries
```

### Autenticación
Requiere **Bearer Token (JWT)**. El token se obtiene del endpoint de autenticación.

### Headers requeridos

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer <token>` |

### Parámetros de Ruta
Ninguno.

### Parámetros Query
Ninguno.

### Request Body
Ninguno.

### Validaciones
No aplica (endpoint de solo lectura).

### Reglas de Negocio
- Solo retorna países con `ESTADO = 'A'` (Activo)
- Ordenados alfabéticamente por descripción
- La fuente de datos es la tabla `OMEGA.CNF_CATALOGO` con filtro `cod_entidad = 'PAIS'`

### Ejemplo de Request

```bash
curl -H "Authorization: Bearer <token>" http://localhost:9001/address/countries
```

### Respuesta Exitosa

**Código HTTP:** `200 OK`

```json
[
  {
    "codigo": "RD",
    "abreviatura": "RD",
    "descripcion": "República Dominicana"
  },
  {
    "codigo": "US",
    "abreviatura": "USA",
    "descripcion": "Estados Unidos"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `codigo` | string | Código del país |
| `abreviatura` | string | Abreviatura del país |
| `descripcion` | string | Nombre completo del país |

### Respuestas de Error

| Código | Error | Descripción |
|--------|-------|-------------|
| `401` | Unauthorized | Token ausente, inválido o expirado |

**401 Unauthorized:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "Missing or invalid authorization header"
}
```

### Estructura de Respuesta

Array de objetos con código, abreviatura y descripción de cada país.

### Flujo del Endpoint

1. El middleware `authMiddleware` valida el token JWT
2. El controlador `getCountriesController` delega en `AddressRepository.getCountries()`
3. El repositorio ejecuta `SELECT cod_catalogo, abreviatura, descripcion FROM OMEGA.CNF_CATALOGO WHERE cod_entidad = 'PAIS' AND ESTADO = 'A' ORDER BY descripcion ASC`
4. Se mapean las filas a objetos `{ codigo, abreviatura, descripcion }`
5. Se retorna el array en la respuesta

### Consideraciones Técnicas

| Elemento | Valor |
|----------|-------|
| Timeout | No especificado |
| Formato fechas | No aplica |
| Zona horaria | No aplica |
| Idempotencia | Sí (GET) |
| Cacheable | Sí (datos de referencia) |

### Resumen Técnico

| Elemento | Valor |
|----------|-------|
| Endpoint | `/address/countries` |
| Método | `GET` |
| Autenticación | Bearer Token (JWT) |
| Roles Permitidos | Todos los autenticados |
| Código Éxito | `200 OK` |
| Código Error | `401 Unauthorized` |

---

## 2. Direcciones - Provincias

### Descripción
Recupera el listado de provincias/departamentos desde el sistema Omega (fuente: `OMEGA.CNF_EQV_PROVINCIA`). Utilizado por el frontend para poblar el selector de provincia en el formulario de dirección.

### Método HTTP
**GET**

### URL
```
GET /address/provinces
```

### Autenticación
Requiere **Bearer Token (JWT)**.

### Headers requeridos

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer <token>` |

### Parámetros de Ruta
Ninguno.

### Parámetros Query
Ninguno.

### Request Body
Ninguno.

### Validaciones
No aplica.

### Reglas de Negocio
- Retorna todas las provincias registradas en `OMEGA.CNF_EQV_PROVINCIA`
- No aplica filtro de estado (todas las provincias están activas)

### Ejemplo de Request

```bash
curl -H "Authorization: Bearer <token>" http://localhost:9001/address/provinces
```

### Respuesta Exitosa

**Código HTTP:** `200 OK`

```json
[
  {
    "codProvincia": "PROV01",
    "descripcion": "Distrito Nacional"
  },
  {
    "codProvincia": "PROV21",
    "descripcion": "Santiago"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `codProvincia` | string | Código de la provincia |
| `descripcion` | string | Nombre de la provincia |

### Respuestas de Error

| Código | Error | Descripción |
|--------|-------|-------------|
| `401` | Unauthorized | Token ausente, inválido o expirado |

### Estructura de Respuesta

Array de objetos con código y descripción de cada provincia.

### Flujo del Endpoint

1. `authMiddleware` valida el token JWT
2. `getProvincesController` llama a `AddressRepository.getProvinces()`
3. Ejecuta `SELECT COD_PROVINCIA_LOCAL AS COD_PROVINCIA, DESCRIPCION FROM OMEGA.CNF_EQV_PROVINCIA`
4. Mapea y retorna el array

### Consideraciones Técnicas

| Elemento | Valor |
|----------|-------|
| Idempotencia | Sí (GET) |
| Cacheable | Sí |

### Resumen Técnico

| Elemento | Valor |
|----------|-------|
| Endpoint | `/address/provinces` |
| Método | `GET` |
| Autenticación | Bearer Token (JWT) |
| Roles Permitidos | Todos los autenticados |
| Código Éxito | `200 OK` |
| Código Error | `401 Unauthorized` |

---

## 3. Direcciones - Ciudades / Municipios

### Descripción
Recupera el listado de ciudades o municipios desde Omega (fuente: `OMEGA.CNF_EQV_MUNICIPIO` join con `CNF_EQV_PROVINCIA`). Puede filtrarse por provincia para carga progresiva. Utilizado por el frontend en el formulario de dirección.

### Método HTTP
**GET**

### URL
```
GET /address/cities
GET /address/cities?provinceId=PROV21
```

### Autenticación
Requiere **Bearer Token (JWT)**.

### Headers requeridos

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer <token>` |

### Parámetros de Ruta
Ninguno.

### Parámetros Query

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `provinceId` | string | No | Código de provincia para filtrar ciudades |

Si no se envía `provinceId`, se retornan todas las ciudades.

### Request Body
Ninguno.

### Validaciones
No aplica validación Zod (middleware de validación de cuerpo no se ejecuta en GET).

### Reglas de Negocio
- La relación provincia ↔ ciudad se resuelve mediante `COD_PROVINCIA_ORIGINAL`
- El filtro se aplica sobre `COD_PROVINCIA_LOCAL` (código local de provincia)
- La consulta usa inner join entre `CNF_EQV_MUNICIPIO` y `CNF_EQV_PROVINCIA`

### Ejemplo de Request

```bash
curl -H "Authorization: Bearer <token>" "http://localhost:9001/address/cities?provinceId=PROV21"
```

### Respuesta Exitosa

**Código HTTP:** `200 OK`

```json
[
  {
    "codCiudad": "CIUD54",
    "codCiudadOriginal": "MUN001",
    "descripcion": "Santiago de los Caballeros",
    "idProvincia": "PROV21",
    "idProvinciaOriginal": "PROV_ORIG_21"
  }
]
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `codCiudad` | string | Código local de la ciudad/municipio |
| `codCiudadOriginal` | string | Código original de la ciudad en el sistema fuente |
| `descripcion` | string | Nombre de la ciudad/municipio |
| `idProvincia` | string | Código local de la provincia a la que pertenece |
| `idProvinciaOriginal` | string | Código original de la provincia |

### Respuestas de Error

| Código | Error | Descripción |
|--------|-------|-------------|
| `401` | Unauthorized | Token ausente, inválido o expirado |

### Estructura de Respuesta

Array de objetos con código de ciudad, código original, descripción y referencia a la provincia.

### Flujo del Endpoint

1. `authMiddleware` valida el token JWT
2. `getCitiesController` lee `provinceId` de `c.req.query('provinceId')`
3. Llama a `AddressRepository.getCities(provinceId)`
4. Construye SQL dinámico: si `provinceId` está presente, agrega `WHERE b.COD_PROVINCIA_LOCAL = :provinceId`
5. Ejecuta la consulta y mapea resultados
6. Retorna el array

### Consideraciones Técnicas

| Elemento | Valor |
|----------|-------|
| Idempotencia | Sí (GET) |
| Cacheable | Sí, con variación por `provinceId` |

### Resumen Técnico

| Elemento | Valor |
|----------|-------|
| Endpoint | `/address/cities` |
| Método | `GET` |
| Autenticación | Bearer Token (JWT) |
| Roles Permitidos | Todos los autenticados |
| Código Éxito | `200 OK` |
| Código Error | `401 Unauthorized` |

---

## 4. Contexto de Activación

### Descripción
Recupera el contexto necesario para inicializar la pantalla de activación de líneas. Actualmente expone las procedencias de equipo disponibles (origen del equipo: equipo nuevo, equipo del cliente, etc.).

### Método HTTP
**GET**

### URL
```
GET /activations/context
```

### Autenticación
Requiere **Bearer Token (JWT)**.

### Headers requeridos

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer <token>` |

### Parámetros de Ruta
Ninguno.

### Parámetros Query
Ninguno.

### Request Body
Ninguno.

### Validaciones
No aplica.

### Reglas de Negocio
- Las procedencias de equipo se obtienen del catálogo `VTA_PROCEDENCIA_EQUIPO`
- Filtro: `ESTADO = 'A'` y `fch_fin > SYSDATE` (vigentes)
- Ordenado alfabéticamente por descripción

### Ejemplo de Request

```bash
curl -H "Authorization: Bearer <token>" http://localhost:9001/activations/context
```

### Respuesta Exitosa

**Código HTTP:** `200 OK`

```json
{
  "procedencias_equipo": [
    {
      "codigo": "EQNUE",
      "descripcion": "Equipo Nuevo"
    },
    {
      "codigo": "EQCLIENTE",
      "descripcion": "Equipo del Cliente"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `procedencias_equipo` | array | Lista de procedencias de equipo disponibles |
| `codigo` | string | Código de la procedencia |
| `descripcion` | string | Descripción de la procedencia |

### Respuestas de Error

| Código | Error | Descripción |
|--------|-------|-------------|
| `401` | Unauthorized | Token ausente, inválido o expirado |
| `500` | Internal Server Error | Error al cargar el contexto |

### Estructura de Respuesta

Objeto con una propiedad `procedencias_equipo` que contiene un array de opciones `{ codigo, descripcion }`.

### Flujo del Endpoint

1. `authMiddleware` valida el token JWT
2. `getActivationContextController` llama a `ActivationContextService.getContext()`
3. El servicio delega en `getProcedenciasEquipo()` del repositorio
4. Ejecuta `SELECT cc.cod_catalogo, cc.descripcion FROM cnf_catalogo cc WHERE cc.cod_entidad = 'VTA_PROCEDENCIA_EQUIPO' AND cc.estado = 'A' AND cc.fch_fin > SYSDATE ORDER BY cc.descripcion`
5. Retorna `{ procedencias_equipo: [...] }`

### Consideraciones Técnicas

| Elemento | Valor |
|----------|-------|
| Idempotencia | Sí (GET) |
| Cacheable | Sí (datos de referencia) |
| Logs | Se registran errores con `getLogger().error()` |

### Resumen Técnico

| Elemento | Valor |
|----------|-------|
| Endpoint | `/activations/context` |
| Método | `GET` |
| Autenticación | Bearer Token (JWT) |
| Roles Permitidos | Todos los autenticados |
| Código Éxito | `200 OK` |
| Código Error | `401 Unauthorized`, `500 Internal Server Error` |

---

## 5. Validación de SIM

### Descripción
Valida que un número serial (SIM) esté disponible para ser utilizado en una activación. Ejecuta múltiples validaciones contra el inventario, almacenes, prospectos y activaciones existentes para determinar si el SIM puede ser asignado a un nuevo cliente.

### Método HTTP
**POST**

### URL
```
POST /sim/validate
```

### Autenticación
Requiere **Bearer Token (JWT)**.

### Headers requeridos

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer <token>` |
| `Content-Type` | Sí | `application/json` |

### Parámetros de Ruta
Ninguno.

### Parámetros Query
Ninguno.

### Request Body

**Ejemplo:**
```json
{
  "sim": "890104000005062459",
  "validationMode": "general"
}
```

**Campos:**

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `sim` | string | Sí | Número serial del SIM (ICCID) a validar | `"890104000005062459"` |
| `validationMode` | string | No | Modo de validación: `general` (por defecto) o `preactivated` | `"general"` |

### Validaciones

| Regla | Descripción |
|-------|-------------|
| `sim` requerido | Se normaliza trimando espacios |
| `validationMode` | Solo acepta `general` o `preactivated`. Default: `general` |

### Reglas de Negocio

El endpoint ejecuta las siguientes validaciones en orden:

| Paso | Validación | Código de rechazo |
|------|-----------|-------------------|
| 1 | Determinar almacén de la entidad de venta del usuario autenticado | — |
| 2 | SIM vacío o nulo | `SIM_NOT_FOUND` |
| 3 | SIM existe en `inv_articulo_maestro` (inventario) | `SIM_NOT_FOUND` |
| 4 | Estado del artículo = `'A'` y estado en almacén = `'K_EXI'` | `SIM_NOT_AVAILABLE` |
| 5 | El almacén del SIM coincide con el almacén de la entidad de venta | `SIM_WRONG_WAREHOUSE` |
| 6 | SIM no debe tener un prospecto pendiente en `vta_articulo_prospecto` | `SIM_IN_PROCESS` |
| 7 | SIM no debe tener un prospecto prepago en la misma tabla | `SIM_ALREADY_RESERVED` |
| 8 | SIM no debe tener una activación pendiente en `usd_venta_activacion` | `SIM_IN_PROCESS` |
| 9 | SIM no debe tener una activación reservada o completada | `SIM_ALREADY_RESERVED` |
| 10 | Si `validationMode = 'general'`, retorna OK | `OK` |
| 11 | Si `validationMode = 'preactivated'`: verificar relación SIM-número activa | `SIM_NUMBER_RELATION_REQUIRED` |
| 12 | Verificar que el número asociado no esté reservado o activo | `NUMBER_RESERVED` |
| 13 | Todas las validaciones pasaron | `OK` |

**Mensajes de error:**

| Código | Mensaje |
|--------|---------|
| `SIM_NOT_FOUND` | El SIM no existe en inventario o no fue encontrado. |
| `SIM_NOT_AVAILABLE` | El SIM existe, pero no está disponible para activación. |
| `SIM_WRONG_WAREHOUSE` | El número serial no pertenece a esta entidad de venta. |
| `SIM_IN_PROCESS` | El SIM está en proceso de activación. Debe seleccionar otro SIM. |
| `SIM_ALREADY_RESERVED` | El SIM ya se encuentra reservado o asociado a una activación activa. |
| `SIM_NUMBER_RELATION_REQUIRED` | El SIM no tiene una relación activa con un número telefónico. Debe preactivarse o asignarse un número antes de usarlo. |
| `NUMBER_RESERVED` | El número asociado al SIM ya está reservado o activo. Debe seleccionar otro SIM. |
| `OK` | El SIM está disponible para ser utilizado. |

### Ejemplo de Request

**cURL:**
```bash
curl -X POST http://localhost:9001/sim/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"sim": "890104000005062459", "validationMode": "general"}'
```

**JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:9001/sim/validate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ sim: '890104000005062459', validationMode: 'general' })
});
const data = await response.json();
```

### Respuesta Exitosa

**Código HTTP:** `200 OK`

```json
{
  "cod_err": "OK",
  "available": true,
  "reasonCode": "OK",
  "message": "El SIM está disponible para ser utilizado.",
  "result": {
    "sim": "890104000005062459",
    "cod_almacen": "ALM01",
    "cod_almacen_entidad_venta": "ALM01",
    "numero": "8095551234",
    "validationMode": "general"
  }
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cod_err` | string | `OK` si la validación se completó, `NOK` si ocurrió un error interno |
| `available` | boolean | `true` si el SIM está disponible, `false` si no |
| `reasonCode` | string | Código de la razón del resultado |
| `message` | string | Mensaje descriptivo del resultado |
| `result.sim` | string | SIM validado |
| `result.cod_almacen` | string (opcional) | Código del almacén donde se encuentra el SIM |
| `result.cod_almacen_entidad_venta` | string (opcional) | Código del almacén asociado a la entidad de venta |
| `result.numero` | string (opcional) | Número telefónico asociado al SIM (si aplica) |
| `result.validationMode` | string | Modo de validación utilizado |

### Respuestas de Error

| Código | Error | Descripción |
|--------|-------|-------------|
| `400` | Bad Request | Error de validación del cuerpo |
| `401` | Unauthorized | Token ausente, inválido o expirado |
| `500` | Internal Server Error | Error interno al validar SIM |

**400 Bad Request:**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation error: sim: El SIM es requerido"
}
```

**401 Unauthorized:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "Missing or invalid authorization header"
}
```

**422 Validation Error (Zod):**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation error: validationMode: Invalid enum value. Expected 'general' | 'preactivated', received 'invalido'"
}
```

### Estructura de Respuesta

El endpoint siempre retorna un objeto con `cod_err`, `available`, `reasonCode`, `message` y `result`. La propiedad `available` indica si el SIM puede ser usado.

### Flujo del Endpoint

1. `authMiddleware` valida el token JWT
2. `validateBody(SimValidateRequestDto)` valida y transforma el cuerpo
3. `validateSimController` extrae los datos validados y el usuario autenticado
4. Llama a `simValidationService.validate(data, context)` con contexto de entidad de venta
5. El servicio ejecuta la cadena de validaciones (pasos 1-13 de Reglas de Negocio)
6. Retorna el resultado de la validación

### Consideraciones Técnicas

| Elemento | Valor |
|----------|-------|
| Timeout | No especificado |
| Idempotencia | No garantizada (el estado del SIM puede cambiar entre llamadas) |
| Logs | Se registran errores con `getLogger().error()` |

### Resumen Técnico

| Elemento | Valor |
|----------|-------|
| Endpoint | `/sim/validate` |
| Método | `POST` |
| Autenticación | Bearer Token (JWT) |
| Roles Permitidos | Todos los autenticados |
| Código Éxito | `200 OK` |
| Código Error | `400 Bad Request`, `401 Unauthorized`, `422 Validation Error`, `500 Internal Server Error` |

---

## 6. Validación de IMEI / Equipo

### Descripción
Valida un número IMEI o serial de equipo (TAGSM) antes de usarlo en una activación. Replica la lógica de validación de la interfaz de usuario de Omega, incluyendo verificación de formato, TAC, equipos robados, clientes activos, inventario y equipos fijos para planes específicos.

### Método HTTP
**POST**

### URL
```
POST /device/validate-imei
```

### Autenticación
Requiere **Bearer Token (JWT)**.

### Headers requeridos

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer <token>` |
| `Content-Type` | Sí | `application/json` |

### Parámetros de Ruta
Ninguno.

### Parámetros Query
Ninguno.

### Request Body

**Ejemplo:**
```json
{
  "imei": "351836499868616",
  "tipo": "TAGSM",
  "cod_plan": "INTRESHI10",
  "cod_linea_negocio": "INTERM",
  "segmento_comercial": "SEG01",
  "procedencia_equipo": "EQNUE",
  "cod_grupo_plan": "GPREP",
  "cod_tipo_activacion": "TACTNUE"
}
```

**Campos:**

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `imei` | string | Sí | IMEI o serial del equipo (15 dígitos) | `"351836499868616"` |
| `tipo` | string | Sí | Tipo de equipo. Valor fijo: `TAGSM` | `"TAGSM"` |
| `cod_plan` | string | Sí | Código del plan seleccionado | `"INTRESHI10"` |
| `cod_linea_negocio` | string | Sí | Código de la línea de negocio | `"INTERM"` |
| `segmento_comercial` | string | Sí | Segmento comercial | `"SEG01"` |
| `procedencia_equipo` | string | Sí | Procedencia del equipo | `"EQNUE"` |
| `cod_grupo_plan` | string | No | Código del grupo de plan | `"GPREP"` |
| `cod_tipo_activacion` | string | No | Código del tipo de activación | `"TACTNUE"` |

### Validaciones Zod

| Campo | Regla |
|-------|-------|
| `imei` | Se normaliza (trim). Requerido, mínimo 1 carácter |
| `tipo` | Debe ser exactamente `"TAGSM"` |
| `cod_plan` | Requerido, mínimo 1 carácter |
| `cod_linea_negocio` | Requerido, mínimo 1 carácter |
| `segmento_comercial` | Requerido, mínimo 1 carácter |
| `procedencia_equipo` | Requerido, mínimo 1 carácter |
| `cod_grupo_plan` | Opcional |
| `cod_tipo_activacion` | Opcional |

### Reglas de Negocio

El endpoint ejecuta las siguientes validaciones en orden:

| Paso | Validación | Código de rechazo |
|------|-----------|-------------------|
| 1 | IMEI debe ser numérico (solo dígitos) | `NOT_NUMERIC` |
| 2 | Para TAGSM: longitud debe ser exactamente 15 dígitos | `INVALID_LENGTH` |
| 3 | Validación de TAC (Type Allocation Code), salvo que el segmento esté configurado para saltarla | `INVALID_TAC` |
| 4 | Para INTERM: validación TAC específica de línea de negocio | `INVALID_CHARACTER`, `INVALID_IMEI`, `INVALID_DEVICE` |
| 5 | Verificar que el serial no esté reportado como robado/negado | `REPORTED_STOLEN` |
| 6 | Verificar que el serial no pertenezca a un cliente activo | `ACTIVE_CUSTOMER` |
| 7 | Verificar que el serial no esté en inventario | `IN_INVENTORY` |
| 8 | Validación de equipo fijo para segmentos "Viva Mi Casa" | `FIXED_DEVICE_REQUIRED` |
| 9 | Todas las validaciones pasaron | `OK` |

**Mensajes de error:**

| Código | Mensaje |
|--------|---------|
| `NOT_NUMERIC` | El numero debe ser decimal |
| `INVALID_LENGTH` | El serial debe contener 15 digitos. |
| `INVALID_TAC` | No es un equipo valido para activar |
| `INVALID_CHARACTER` | Longitud de serie del equipo no es valida |
| `INVALID_IMEI` | Serie del Equipo no valida |
| `INVALID_DEVICE` | Equipo no valido para activar |
| `REPORTED_STOLEN` | El ESN ha sido reportado como robado |
| `ACTIVE_CUSTOMER` | El ESN ya pertenece a un cliente activo |
| `IN_INVENTORY` | El ESN esta en Inventario |
| `FIXED_DEVICE_REQUIRED` | Serie Incorrecta. En Planes Viva Mi Casa Solo se pueden activar Equipos Fijos. |
| `OK` | Serie libre para activar |

### Ejemplo de Request

**cURL:**
```bash
curl -X POST http://localhost:9001/device/validate-imei \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "imei": "351836499868616",
    "tipo": "TAGSM",
    "cod_plan": "INTRESHI10",
    "cod_linea_negocio": "INTERM",
    "segmento_comercial": "SEG01",
    "procedencia_equipo": "EQNUE"
  }'
```

### Respuesta Exitosa

**Código HTTP:** `200 OK`

```json
{
  "cod_err": "OK",
  "valid": true,
  "reasonCode": "OK",
  "message": "Serie libre para activar"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cod_err` | string | `OK` si la validación se completó, `NOK` si ocurrió un error interno |
| `valid` | boolean | `true` si el equipo es válido, `false` si no |
| `reasonCode` | string | Código de la razón del resultado |
| `message` | string | Mensaje descriptivo del resultado |

### Respuestas de Error

| Código | Error | Descripción |
|--------|-------|-------------|
| `400` | Bad Request | Error de validación del cuerpo |
| `401` | Unauthorized | Token ausente, inválido o expirado |
| `422` | Validation Error | Error de validación Zod (enum, tipo, etc.) |
| `500` | Internal Server Error | Error interno al validar IMEI |

### Estructura de Respuesta

Objeto con código de error, indicador booleano de validez, código de razón y mensaje descriptivo.

### Flujo del Endpoint

1. `authMiddleware` valida el token JWT
2. `validateBody(ImeiValidateRequestDto)` valida y transforma el cuerpo
3. `validateImeiController` extrae los datos validados
4. Llama a `ImeiValidationService.validateOmegaExactImei(data)`
5. El servicio ejecuta la cadena de validaciones contra funciones Oracle y tablas del sistema
6. Retorna `{ cod_err, valid, reasonCode, message }`

### Consideraciones Técnicas

| Elemento | Valor |
|----------|-------|
| Idempotencia | Sí (mismo IMEI → mismo resultado en el mismo estado del sistema) |
| Dependencias | Funciones Oracle: `mt_ssn_util.es_tac_valido`, `tx_inv_device_tac.validar_imei_tac`, `mt_ssn_util.es_serie_negada`, `tx_inv_articulo.existe_en_omega`, etc. |

### Resumen Técnico

| Elemento | Valor |
|----------|-------|
| Endpoint | `/device/validate-imei` |
| Método | `POST` |
| Autenticación | Bearer Token (JWT) |
| Roles Permitidos | Todos los autenticados |
| Código Éxito | `200 OK` |
| Código Error | `400 Bad Request`, `401 Unauthorized`, `422 Validation Error`, `500 Internal Server Error` |

---

## 7. Creación de Prospecto / Cliente

### Descripción
Crea un nuevo prospecto o cliente en el sistema. Ejecuta un flujo completo que incluye: validación de SIM, validación de equipo, y dependiendo de la línea de negocio, activación directa (PREPAGO) o creación de prospecto con generación de contrato digital (HÍBRIDO). 

**Dos flujos posibles:**
- **Flujo HÍBRIDO** (`codLineaNegocio = 'HIBRID' | 'HIBRIDO'`): Envía toda la información del cliente a Omega mediante `crearProspectoConDocumento`, que crea el prospecto, genera el contrato digital y retorna el ID del contrato.
- **Flujo PREPAGO** (cualquier otro valor): Activa la línea directamente mediante el procedimiento PL/SQL `TX_USD_VENTA_ACTIVACION.ALTA`.

### Método HTTP
**POST**

### URL
```
POST /clients/
```

### Autenticación
Requiere **Bearer Token (JWT)**.

### Headers requeridos

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer <token>` |
| `Content-Type` | Sí | `application/json` |

### Parámetros de Ruta
Ninguno.

### Parámetros Query
Ninguno.

### Request Body

**Ejemplo completo (HÍBRIDO):**
```json
{
  "document": "40210957300",
  "documentType": "CI",
  "sim": "890104000005062459",

  "cod_tipo_persona_cliente": "TPNAT",
  "nombre": "STARLING DANIEL",
  "apellido": "ROSARIO FRANCO",
  "apellido_materno": "",
  "cod_estado_civil": "S",
  "sexo": "MAS",
  "fch_nacimiento": "2001-07-17",

  "email": "juan@example.com",
  "telf_residencia": "8097324287",
  "telf_contacto": "8493980871",

  "cod_pais": "RD",
  "cod_provincia": "PROV21",
  "cod_ciudad": "CIUD54",
  "zona_barrio_urb": "",
  "sector": "",
  "numero_dir": "",
  "calle_av_pasaje": "",
  "entre_calle_1": "",
  "entre_calle_2": "",
  "edificio": "",
  "piso": "",
  "apartamento": "",
  "observacion": "",

  "codLineaNegocio": "INTERM",
  "cod_articulo_sim": "6995",
  "nro_serie_equipo": "351836499868616",
  "cod_plan": "INTRESHI10",
  "pcs_alterno": "8094184069"
}
```

**Campos:**

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `document` | string | **Sí** | Número de documento del cliente | `"40210957300"` |
| `documentType` | string | **Sí** | Tipo de documento: `CI` o `PAS` | `"CI"` |
| `sim` | string | **Sí** | ICCID del SIM | `"890104000005062459"` |
| `cod_tipo_persona_cliente` | string | No | Tipo de persona: `TPNAT` (natural) | `"TPNAT"` |
| `nombre` | string | No | Nombre(s) del cliente | `"STARLING DANIEL"` |
| `apellido` | string | No | Apellido(s) del cliente | `"ROSARIO FRANCO"` |
| `apellido_materno` | string | No | Apellido materno | `""` |
| `cod_estado_civil` | string | No | Estado civil (`S`, `C`, `D`, etc.) | `"S"` |
| `sexo` | string | No | Sexo (`MAS` o `FEM`) | `"MAS"` |
| `fch_nacimiento` | string | No | Fecha de nacimiento (YYYY-MM-DD) | `"2001-07-17"` |
| `email` | string | No | Correo electrónico | `"juan@example.com"` |
| `telf_residencia` | string | No | Teléfono de residencia | `"8097324287"` |
| `telf_contacto` | string | No | Teléfono de contacto | `"8493980871"` |
| `cod_pais` | string | No | Código del país | `"RD"` |
| `cod_provincia` | string | No | Código de provincia | `"PROV21"` |
| `cod_ciudad` | string | No | Código de ciudad/municipio | `"CIUD54"` |
| `zona_barrio_urb` | string | No | Zona, barrio o urbanización | `""` |
| `sector` | string | No | Sector | `""` |
| `numero_dir` | string | No | Número de la dirección | `""` |
| `calle_av_pasaje` | string | No | Calle, avenida o pasaje | `""` |
| `entre_calle_1` | string | No | Entre calle 1 | `""` |
| `entre_calle_2` | string | No | Entre calle 2 | `""` |
| `edificio` | string | No | Edificio | `""` |
| `piso` | string | No | Piso | `""` |
| `apartamento` | string | No | Apartamento | `""` |
| `observacion` | string | No | Observaciones | `""` |
| `codLineaNegocio` | string | No | Línea de negocio. `HIBRID`/`HIBRIDO` activa flujo híbrido | `"INTERM"` |
| `cod_articulo_sim` | string | No | Código de artículo del SIM | `"6995"` |
| `nro_serie_equipo` | string | No | IMEI/serial del equipo | `"351836499868616"` |
| `cod_plan` | string | No | Código del plan | `"INTRESHI10"` |
| `pcs_alterno` | string | No | Número PCS alternativo | `"8094184069"` |

### Validaciones Zod

| Campo | Regla |
|-------|-------|
| `document` | Requerido, mínimo 1 carácter |
| `sim` | Requerido, mínimo 1 carácter |
| `documentType` | Debe ser `"PAS"` o `"CI"` |
| `email` | Si se envía, debe ser un email válido |
| `pcs_alterno` | Si se envía, validado en controlador con regex: `^1?[0-9]{3}[0-9]{3}[0-9]{4}$` |

### Validaciones Adicionales (Controlador)

| Regla | Descripción |
|-------|-------------|
| SIM > 18 caracteres | Se trunca eliminando el último carácter |
| Formato PCS alterno | Regex: `^1?[0-9]{3}[0-9]{3}[0-9]{4}$` |
| PAS sin nombres | Si `documentType = 'PAS'` y no hay `nombre` y `apellido`, error |
| SIM disponible | Se valida contra `POST /sim/validate` |
| Equipo válido | Se valida con `validateEquipmentSerialForActivation` |

### Reglas de Negocio

1. El usuario autenticado provee `saleEntityId` y `entityFatherId` desde el token JWT
2. SIM validation mediante `simValidationService.validate()` con modo `general`
3. Equipment serial validation mediante `validateEquipmentSerialForActivation()`:
   - Si el serial está vacío o no tiene 15 dígitos o es todo ceros → se salta
   - Validación TAC, IMEI, robado, cliente activo, inventario
4. **Flujo HÍBRIDO** (`codLineaNegocio = 'HIBRID' | 'HIBRIDO'`):
   - Llama a `callCrearProspectoConDocumento()` → Omega REST API `/wsomega/crearProspectoConDocumento`
   - La respuesta de Omega incluye: `pcs`, `id_prospecto`, `id_registro`, `id_archivo`, `documento_url`, `estado_contrato`
   - Se obtiene el precio de activación mediante `getPriceActivation()`
5. **Flujo PREPAGO** (otros):
   - Llama a `activatePcs()` → procedimiento PL/SQL `TX_USD_VENTA_ACTIVACION.ALTA`
   - Retorna `pcs`, `id_registro`

### Ejemplo de Request

**cURL:**
```bash
curl -X POST http://localhost:9001/clients/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "40210957300",
    "documentType": "CI",
    "sim": "890104000005062459",
    "codLineaNegocio": "INTERM",
    "cod_plan": "INTRESHI10",
    "nro_serie_equipo": "351836499868616",
    "cod_articulo_sim": "6995",
    "nombre": "STARLING DANIEL",
    "apellido": "ROSARIO FRANCO",
    "cod_estado_civil": "S",
    "sexo": "MAS",
    "fch_nacimiento": "2001-07-17",
    "cod_pais": "RD",
    "cod_provincia": "PROV21",
    "cod_ciudad": "CIUD54",
    "email": "juan@example.com",
    "telf_residencia": "8097324287",
    "telf_contacto": "8493980871",
    "pcs_alterno": "8094184069"
  }'
```

### Respuesta Exitosa

**Código HTTP:** `201 Created`

**Flujo HÍBRIDO:**
```json
{
  "pcsNumber": "8095551234",
  "document": "40210957300",
  "sim": "890104000005062459",
  "valor": "1500.00",
  "id_registro": "403074",
  "id_prospecto": "289063541",
  "id_archivo": "3497339",
  "documento_url": "/supreme/index.php/wsomega/getContrato/289063541",
  "estado_contrato": "PEND"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `pcsNumber` | string | Número PCS asignado |
| `document` | string | Documento del cliente |
| `sim` | string | ICCID del SIM |
| `valor` | string | Precio de activación |
| `id_registro` | string | ID del registro de activación |
| `id_prospecto` | string (opcional) | ID del prospecto creado (solo HÍBRIDO) |
| `id_archivo` | string (opcional) | ID del archivo de contrato (solo HÍBRIDO) |
| `documento_url` | string (opcional) | URL para descargar el contrato (solo HÍBRIDO) |
| `estado_contrato` | string (opcional) | Estado del contrato (solo HÍBRIDO) |

**Flujo PREPAGO:**
```json
{
  "pcsNumber": "8095551234",
  "document": "40210957300",
  "sim": "890104000005062459",
  "valor": "0",
  "id_registro": "403074",
  "id_prospecto": null
}
```

### Respuestas de Error

| Código | Error | Descripción |
|--------|-------|-------------|
| `400` | Bad Request | Error de validación de campos |
| `401` | Unauthorized | Token ausente, inválido o expirado |
| `422` | Validation Error | Error de validación Zod |
| `500` | Internal Server Error | Error interno del servidor |

**400 Bad Request:**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "El SIM está en proceso de activación. Debe seleccionar otro SIM."
}
```

**401 Unauthorized:**
```json
{
  "code": "UNAUTHORIZED",
  "message": "Missing or invalid authorization header"
}
```

### Estructura de Respuesta

Objeto con el número PCS asignado, documento, SIM, valor y referencias al registro/prospecto/contrato según el flujo.

### Flujo del Endpoint

1. `authMiddleware` valida el token JWT
2. `validateBody(CreateClientFromAppDto)` valida y transforma el cuerpo (snake_case → camelCase)
3. `createClientController` ejecuta:
   - Truncamiento de SIM si > 18 caracteres
   - Validación de formato de PCS alterno
   - Determinación de tipo de documento
   - Validación de nombres para PAS
   - Validación de SIM contra `POST /sim/validate`
   - Validación de equipo serial
4. Si `isHybridFlow(data.codLineaNegocio)`:
   - Construye payload completo con todos los campos mapeados
   - Llama a Omega (HTTP POST) para crear prospecto + generar contrato
   - Obtiene precio de activación
   - Retorna respuesta con datos del contrato
5. Si NO es híbrido (PREPAGO):
   - Llama a procedimiento PL/SQL `TX_USD_VENTA_ACTIVACION.ALTA`
   - Retorna respuesta con PCS y registro
6. En caso de error, se registra en el logger y se propaga la excepción

### Consideraciones Técnicas

| Elemento | Valor |
|----------|-------|
| Timeout | No especificado |
| Idempotencia | No garantizada (cada llamada crea un nuevo prospecto/activación) |
| Logs | Errores registrados con `getLogger().error()` |
| Mapeo | Los campos snake_case del frontend se convierten a camelCase internamente |

### Resumen Técnico

| Elemento | Valor |
|----------|-------|
| Endpoint | `/clients/` |
| Método | `POST` |
| Autenticación | Bearer Token (JWT) |
| Roles Permitidos | Todos los autenticados |
| Código Éxito | `201 Created` |
| Código Error | `400 Bad Request`, `401 Unauthorized`, `422 Validation Error`, `500 Internal Server Error` |

---

## 8. Firma de Contrato

### Descripción
Recibe las firmas del cliente y del agente (en base64), regenera el PDF del contrato con las firmas embebidas y finaliza el proceso de contratación en Omega. El contrato queda en estado `PEND` (pendiente de activación). Acepta tanto `idProspecto` como `idRegistro` en camelCase o snake_case.

### Método HTTP
**POST**

### URL
```
POST /api/contracts/signatures
```

### Autenticación
Requiere **Bearer Token (JWT)**.

### Headers requeridos

| Header | Requerido | Descripción |
|--------|-----------|-------------|
| `Authorization` | Sí | `Bearer <token>` |
| `Content-Type` | Sí | `application/json` |

### Parámetros de Ruta
Ninguno.

### Parámetros Query
Ninguno.

### Request Body

**Ejemplo:**
```json
{
  "id_prospecto": 289063541,
  "id_registro": 403074,
  "signClient": "iVBORw0KGgoAAAANSUhEUgAA...",
  "signAgent": "iVBORw0KGgoAAAANSUhEUgAA...",
  "cod_usuario": "SROSARIO"
}
```

**Campos:**

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `idProspecto` / `id_prospecto` | number | Condicional | ID del prospecto (al menos uno de los 4 IDs) | `289063541` |
| `idRegistro` / `id_registro` | number | Condicional | ID del registro de activación | `403074` |
| `signClient` | string | **Sí** | Firma del cliente en base64 (sin prefijo `data:`) | `"iVBORw0KGgo..."` |
| `signAgent` | string | **Sí** | Firma del agente en base64 | `"iVBORw0KGgo..."` |
| `codUsuario` / `cod_usuario` | string | No | Código del usuario que firma. Si no se envía, se obtiene del token JWT | `"SROSARIO"` |

**Nota:** Al menos uno de `idProspecto`, `id_prospecto`, `idRegistro` o `id_registro` debe ser proporcionado. Si solo se envía `idRegistro`, el sistema resuelve `idProspecto` automáticamente.

### Validaciones Zod

| Regla | Descripción |
|-------|-------------|
| `signClient` | Requerido, mínimo 1 carácter (base64) |
| `signAgent` | Requerido, mínimo 1 carácter (base64) |
| IDs | Al menos uno de los cuatro campos de ID debe estar presente |
| CamelCase/snake_case | `idProspecto` y `id_prospecto` se unifican; `idRegistro` e `id_registro` se unifican; `codUsuario` y `cod_usuario` se unifican |

### Reglas de Negocio

1. Si solo se envía `idRegistro` (sin `idProspecto`), el servicio resuelve `idProspecto` consultando `omega.usd_venta_activacion`
2. Si solo se envía `idProspecto`, el servicio resuelve `idRegistro` desde `omega.usd_venta_activacion` (primera fila ordenada por fecha descendente)
3. Las firmas base64 se limpian del prefijo `data:image/...;base64,` antes de enviarlas a Omega
4. Se llama a Omega endpoint `/wsomega/finalizarContratoApptiva` que:
   - Recupera `id_tran` y `fch_tran` de la activación existente
   - Regenera el PDF con las firmas embebidas
   - **No cambia el estado del contrato** (permanece en `PEND`)
   - Registra el `cod_gestion_tran = 'APPFIRM'`
   - Retorna los datos del contrato firmado
5. El contrato generado está disponible para descarga mediante `documento_url`

### Ejemplo de Request

**cURL:**
```bash
curl -X POST http://localhost:9001/api/contracts/signatures \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id_prospecto": 289063541,
    "id_registro": 403074,
    "signClient": "iVBORw0KGgoAAAANSUhEUgAA...",
    "signAgent": "iVBORw0KGgoAAAANSUhEUgA...",
    "cod_usuario": "SROSARIO"
  }'
```

**JavaScript (fetch):**
```javascript
const response = await fetch('http://localhost:9001/api/contracts/signatures', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_prospecto: 289063541,
    id_registro: 403074,
    signClient: firmaClienteBase64,
    signAgent: firmaAgenteBase64,
    cod_usuario: 'SROSARIO'
  })
});
const data = await response.json();
```

### Respuesta Exitosa

**Código HTTP:** `200 OK`

```json
{
  "cod_err": "OK",
  "msj_err": "",
  "id_prospecto": 289063541,
  "id_archivo": 3497339,
  "documento_url": "/supreme/index.php/wsomega/getContrato/289063541",
  "estado": "CONTRATO_PENDIENTE",
  "id_tran": "403074",
  "cod_gestion_tran": "APPFIRM",
  "fch_tran": "02-JUN-26",
  "mensaje": "Contrato firmado exitosamente. Pendiente de activacion.",
  "id_registro": 403074
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cod_err` | string | `OK` si la operación fue exitosa |
| `msj_err` | string | Mensaje de error (vacío si OK) |
| `id_prospecto` | number | ID del prospecto |
| `id_archivo` | number | ID del archivo PDF del contrato |
| `documento_url` | string | URL relativa para descargar el contrato firmado |
| `estado` | string | Estado actual del contrato (`CONTRATO_PENDIENTE`) |
| `id_tran` | string | ID de transacción asociada a la firma |
| `cod_gestion_tran` | string | Código de gestión de la transacción (`APPFIRM`) |
| `fch_tran` | string | Fecha de la transacción |
| `mensaje` | string | Mensaje descriptivo del resultado |
| `id_registro` | number | ID del registro de activación (resuelto y añadido por Apptiva) |

### Respuestas de Error

| Código | Error | Descripción |
|--------|-------|-------------|
| `400` | Bad Request | Error de validación de campos |
| `401` | Unauthorized | Token ausente, inválido o expirado |
| `404` | Not Found | No se encontró la activación con el ID proporcionado |
| `422` | Validation Error | Error de validación Zod |
| `500` | Internal Server Error | Error interno del servidor |

**400 Bad Request:**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation error: signClient: String must contain at least 1 character(s)"
}
```

**404 Not Found:**
```json
{
  "code": "NOT_FOUND",
  "message": "No se encontró activación para idProspecto 289063541"
}
```

### Estructura de Respuesta

Objeto con código de error, IDs de prospecto/registro/archivo, URL del contrato, estado, información de transacción y mensaje.

### Flujo del Endpoint

1. `authMiddleware` valida el token JWT
2. `validateBody(SubmitContractSignaturesRequestDto)` valida y transforma (unifica camelCase/snake_case)
3. `submitContractSignaturesController`:
   - Si `codUsuario` no se envió, se obtiene del token JWT via `getCodUsuario(c)`
   - Resuelve la referencia de activación mediante `omegaContractService.resolveActivationReference()`:
     - Si `idRegistro` está presente, busca `idProspecto` en `usd_venta_activacion`
     - Si solo `idProspecto` está presente, busca `idRegistro`
   - Llama a `omegaContractService.finalizeContract()`:
     - Limpia el prefijo `data:image/...;base64,` de las firmas
     - Envía POST a Omega: `/wsomega/finalizarContratoApptiva`
     - Omega recupera `id_tran` y `fch_tran` de `usd_venta_activacion`
     - Omega regenera el PDF del contrato con firmas embebidas
     - Omega retorna los datos del contrato
   - Si `cod_err !== 'OK'`, lanza error de validación
   - Retorna la respuesta combinada con `id_registro` resuelto

### Consideraciones Técnicas

| Elemento | Valor |
|----------|-------|
| Timeout | No especificado |
| Idempotencia | No garantizada (cada llamada regenera el PDF) |
| Logs | Errores registrados con `getLogger().error()` |
| Dependencia externa | Omega REST API: `POST /wsomega/finalizarContratoApptiva` |
| Formato firma | Las firmas deben ser base64 sin prefijo `data:`; el servicio limpia el prefijo automáticamente |
| Fechas | Formato `DD-MON-YY` (ej. `02-JUN-26`) |
| Transacciones | `cod_gestion_tran = 'APPFIRM'` identifica las firmas realizadas desde Apptiva |

### Resumen Técnico

| Elemento | Valor |
|----------|-------|
| Endpoint | `/api/contracts/signatures` |
| Método | `POST` |
| Autenticación | Bearer Token (JWT) |
| Roles Permitidos | Todos los autenticados |
| Código Éxito | `200 OK` |
| Código Error | `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `422 Validation Error`, `500 Internal Server Error` |

---

## Resumen Global

| # | Endpoint | Método | Autenticación | Código Éxito | Propósito |
|---|----------|--------|---------------|--------------|-----------|
| 1 | `/address/countries` | GET | JWT | 200 | Lista de países |
| 2 | `/address/provinces` | GET | JWT | 200 | Lista de provincias |
| 3 | `/address/cities` | GET | JWT | 200 | Ciudades filtradas por provincia |
| 4 | `/activations/context` | GET | JWT | 200 | Procedencias de equipo |
| 5 | `/sim/validate` | POST | JWT | 200 | Validación de SIM |
| 6 | `/device/validate-imei` | POST | JWT | 200 | Validación de IMEI/equipo |
| 7 | `/clients/` | POST | JWT | 201 | Creación de prospecto/cliente |
| 8 | `/api/contracts/signatures` | POST | JWT | 200 | Firma de contrato digital |

---

*Documentación generada el 02/06/2026*
*Versión API: 2.0.0*

 # Sistema de Gestión Hotelera – Fullstack

Sistema de gestión hotelera desarrollado como proyecto personal fullstack, enfocado en aplicar buenas prácticas de arquitectura backend, modelado de dominio, desarrollo frontend moderno y contenerización con Docker.

El proyecto busca simular el funcionamiento real de un hotel, cubriendo procesos como gestión de usuarios, habitaciones, reservas y pagos.

**🚧 Proyecto en desarrollo activo.**

---
## 📌 Objetivo del proyecto

- Este proyecto tiene como propósito:
- Aplicar principios de diseño orientado al dominio.
- Implementar una API REST robusta con Spring Boot.
- Desarrollar un frontend moderno con React.
- Integrar frontend y backend mediante comunicación REST.
- Contenerizar todos los servicios (frontend, backend y base de datos) usando Docker Compose.
- Simular una arquitectura real de despliegue lista para producción.

---
## 🧱 Arquitectura del sistema
El sistema está pensado con tres servicios:

`Frontend (React)
        |
Backend (Spring Boot - API REST)
        |
PostgreSQL (Base de datos)`

Por ahora, `docker-compose.yml` levanta **backend + base de datos**; el frontend todavía no forma parte de la orquestación (ver estado más abajo).

### Backend

- API REST con Spring Boot
- Persistencia con Spring Data JPA
- PostgreSQL como base de datos
- Autenticación y autorización con Spring Security + JWT
- Documentación automática con Swagger / OpenAPI

### Frontend

- **No iniciado todavía.** La carpeta `frontend/` existe en el repositorio pero está vacía; no hay código, dependencias ni servicio en `docker-compose.yml` para este componente.

### Base de datos
- PostgreSQL
- Modelada a partir de análisis conceptual y lógico del dominio

---
## 🧠 Modelado del dominio

Antes de la implementación se realizó:

- Modelo conceptual
- Modelo lógico de base de datos
- Diagrama de clases

Esto permitió mantener coherencia entre:

- Reglas del negocio
- Estructura de la base de datos
- Entidades JPA
- Flujo de la aplicación

---
## 🔧 Tecnologías utilizadas

### Backend

- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT (jjwt) para autenticación stateless
- BCrypt para hash de contraseñas
- PostgreSQL
- Swagger / OpenAPI (springdoc)
- Bean Validation (Jakarta Validation)
- MapStruct

### Frontend

- React *(planeado, aún no implementado)*
- JavaScript
- Axios para consumo de API

### DevOps

- Docker
- Docker Compose

---
## ⚙️ Funcionalidades implementadas
### 👤 Usuarios y autenticación

- Registro de usuarios con rol de **cliente** (`POST /usuarios`, endpoint público)
- Contraseñas almacenadas con hash BCrypt
- Inicio de sesión mediante correo y contraseña, con emisión de token **JWT** (`POST /login`)
- Autorización por rol en los endpoints mediante `@PreAuthorize` (`CLIENTE` / `ADMINISTRADOR`)
- Sesión sin estado (`STATELESS`): el token se envía en cada petición vía header `Authorization: Bearer <token>`
- Gestión de clientes por parte del administrador (listar por rol, eliminar)

### 🏨 Habitaciones

- Creación de nuevas habitaciones por parte del administrador
- Edición de la información de las habitaciones
- Eliminación de habitaciones junto con toda su información asociada
- Consulta de habitaciones disponibles en el hotel
- Filtrado de habitaciones por tipo y precio
- Filtrado de habitaciones por disponibilidad según fecha de inicio y fin
- Asociación de múltiples imágenes a una habitación
- Manejo de estados de la habitación (disponible, ocupada, en mantenimiento)
- Actualización automática del estado de la habitación al marcar la entrada de un cliente

### 📅 Reservas

- Creación de reservas por parte del cliente para un rango de fechas válido
- Validación de fechas para garantizar que no se crucen reservas existentes
- Búsqueda de reservas por:
  - Nombre del cliente
  - Nombre del cliente y habitación reservada
- Cancelación de reservas
- Manejo de estados de la reserva:
  - Confirmada
  - Cancelada
  - Completada
- Marcado de entrada del cliente (actualiza el estado de la habitación a ocupada) — solo administrador
- Marcado de salida del cliente y actualización de la reserva a **Completada** — solo administrador
- Visualización del historial de reservas del cliente autenticado (confirmadas, canceladas y completadas)

### 📄 Documentación

- Documentación de la API disponible mediante **Swagger**, con soporte de autenticación Bearer (JWT) integrado en la UI

---
## 🔐 Seguridad

Implementado:

- Spring Security + JWT (firma HS256) para autenticación stateless
- Contraseñas con hash BCrypt (no se almacenan en texto plano)
- Autorización por rol a nivel de endpoint (`@PreAuthorize`)
- Verificación de propiedad (ownership) del recurso al crear y cancelar reservas: el usuario se resuelve desde el JWT, no desde datos enviados por el cliente
- CORS configurado a nivel de aplicación

Pendiente / mejoras de endurecimiento planeadas:

- Restringir la política de CORS a orígenes concretos en producción
- Externalizar la clave de firma JWT a variables de entorno (actualmente es válida solo durante la vida del proceso)
- Revisar el manejo de errores para evitar respuestas 500 genéricas en casos de recurso no encontrado
- Sanitización adicional en la subida de imágenes de habitaciones

---
## 💳 Próximas funcionalidades

- Desarrollo del frontend en React
- Integración de pasarela de pagos
- Envío de notificaciones (correo)
- Despliegue en AWS
- Separación de perfiles dev/prod
- CI/CD
- Incorporar el frontend a `docker-compose.yml`

---
## ▶️ Ejecución del proyecto

- Clonar el repositorio:
`git clone https://github.com/AlfonsoMSDL/Proyecto-hotel.git`
- Moverse a la carpeta del proyecto:
`cd Proyecto-hotel`
- Configurar las variables de entorno del backend (`backend/.env`, ver `backend/.env` de ejemplo)
- Ejecutar con Docker compose (levanta backend + base de datos):
`docker compose up --build`

---
## 📑 Documentación de la API
Una vez el proyecto esté en ejecución, la documentación de los endpoints está disponible en:

`http://localhost:8181/hotel/api/swagger-ui/index.html`

Para probar endpoints protegidos desde Swagger: iniciar sesión en `POST /hotel/api/login`, copiar el token devuelto y pegarlo en el botón **Authorize** (esquema `bearerAuth`) de la interfaz.

---
## 📌 Estado del proyecto

**🚧 En desarrollo**

El backend cubre gestión de usuarios, habitaciones, reservas y autenticación/autorización con Spring Security + JWT. El frontend aún no se ha iniciado. El proyecto continúa evolucionando conforme avanza su implementación.

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
El sistema está compuesto por tres servicios principales:

`Frontend (React)
        |
Backend (Spring Boot - API REST)
        |
PostgreSQL (Base de datos)`

Todos los servicios se levantan con un solo comando mediante Docker Compose.

### Backend

- API REST con Spring Boot
- Persistencia con Spring Data JPA
- PostgreSQL como base de datos
- Documentación automática con Swagger

### Frontend

- Consumo de la API REST del backend
- Visualización de habitaciones disponibles
- Calendario de ocupación
- Gestión de reservas
- Interfaz diferenciada para cliente y administrador (en desarrollo)

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
- PostgreSQL
- Swagger / OpenAPI

### Frontend

- React
- JavaScript
- Axios para consumo de API
- Docker

### DevOps

- Docker
- Docker Compose

---
## ⚙️ Funcionalidades implementadas
### 👤 Usuarios y autenticación

- Registro de usuarios con rol de **cliente**
- Inicio de sesión mediante correo y contraseña
- Manejo de roles (cliente / admin)
- Gestión de clientes por parte del administrador

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
- Visualización de un calendario de ocupación por habitación, bloqueando fechas no disponibles
- Búsqueda de reservas por:
  - Nombre del cliente
  - Nombre del cliente y habitación reservada
- Cancelación de reservas por parte del cliente
- Manejo de estados de la reserva:
  - Confirmada
  - Cancelada
  - Completada
- Marcado de entrada del cliente (actualiza el estado de la habitación a ocupada)
- Marcado de salida del cliente y actualización de la reserva a **Completada**
- Visualización del historial de reservas del cliente (confirmadas, canceladas y completadas)

### 📄 Documentación

- Documentación de la API disponible mediante **Swagger**

---
## 🔐 Seguridad (En desarrollo)
Actualmente:
- Autenticación básica implementada

Pendiente:

- Implementación de Spring Security
- Autenticación con JWT
- Control de acceso por rol a endpoints
- Protección de rutas en frontend

---
## 💳 Próximas funcionalidades

- Integración de pasarela de pagos
- Envío de notificaciones (correo)
- Despliegue en AWS
- Separación de perfiles dev/prod
- CI/CD
- Mejoras en UI/UX del frontend

---
## ▶️ Ejecución del proyecto

- Clonar el repositorio:
`git clone https://github.com/AlfonsoMSDL/Proyecto-hotel-backend.git`
- Moverse a la carpeta del proyecto:
`cd Proyecto-hotel-backend`
- Ejecutar con Docker compose:
`docker compose up --build`

---
## 📑 Documentación de la API
Una vez el proyecto esté en ejecución, la documentación de los endpoints está disponible en:

`http://localhost:8181/hotel/api/swagger-ui/index.html`

---
## 📌 Estado del proyecto

**🚧 En desarrollo**

El proyecto continúa evolucionando, incorporando nuevas funcionalidades y mejoras conforme avanza su implementación.

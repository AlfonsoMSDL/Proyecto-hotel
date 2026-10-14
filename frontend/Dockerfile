# =========================================================
# ETAPA 1: Compilacion del proyecto (Builder)
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias para aprovechar la caché de capas de Docker
COPY package*.json ./

# Instalación limpia de dependencias de producción y desarrollo
RUN npm ci

# Copiar el resto del código fuente de la aplicación
COPY . .

# Proceso de compilación estática (genera la carpeta /app/dist)
RUN npm run build

# =========================================================
# ETAPA 2: Servidor web de producción (Nginx Alpine)
# =========================================================
FROM nginx:alpine

# Eliminar la configuración predeterminada de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos compilados desde la etapa 'builder'
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Ejecutar Nginx en primer plano (necesario para mantener el contenedor activo)
CMD ["nginx", "-g", "daemon off;"]
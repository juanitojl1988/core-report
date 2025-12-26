# ------------------------------
# Stage 1: Build
# ------------------------------
FROM node:22 AS builder

WORKDIR /usr/src/app

# Copia los archivos de configuración
COPY ./code/package*.json ./
COPY ./code/prisma ./prisma/

# Instala TODAS las dependencias (necesario para el build)
RUN npm ci

# Copia el código fuente
COPY ./code/ .

# Genera el cliente de Prisma
RUN npx prisma generate

# Compila el proyecto nestjs
RUN npm run build

# ------------------------------
# Stage 2: Production
# ------------------------------
FROM node:22-slim

ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Instalar dependencias del sistema necesarias para Puppeteer y Chromium (Runtime)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-glib-1-2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    x11-utils \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV chrome_launchOptions_args=--no-sandbox

# Copia package.json para instalar solo dependencias de producción
COPY ./code/package*.json ./

# Instala solo dependencias de producción y limpia caché
RUN npm ci --only=production && npm cache clean --force

# Copia el build generado desde el stage 'builder'
COPY --from=builder /usr/src/app/dist ./dist

# Copia el cliente de Prisma generado desde el builder (evita usar npx en producción)
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/prisma ./prisma

# Exponer el puerto
EXPOSE 3000

# Usuario no root por seguridad (opcional, pero recomendado)
# USER node

# Comando de inicio
CMD ["npm", "run", "start:prod"]

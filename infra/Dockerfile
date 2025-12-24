# Usa una imagen base oficial de Node.js
FROM node:22

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Instalar dependencias del sistema necesarias para Puppeteer y Chromium
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
    && rm -rf /var/lib/apt/lists/*

# Deshabilitar la verificación del certificado


# Establece el directorio de trabajo
WORKDIR /usr/src/app


# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

#ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV chrome_launchOptions_args=--no-sandbox

# Instala las dependencias
RUN npm install --production

RUN npm install -g @nestjs/cli

# Copia el resto de la aplicación
COPY . .

# Genera el cliente de Prisma
RUN npx prisma generate

# Compila el proyecto
RUN npm run build

# Expone el puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación en modo de producción
CMD ["npm", "run", "start:prod"]

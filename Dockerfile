# Usa una imagen base oficial de Node.js
FROM node:22-alpine


RUN apk add --no-cache \
    gconf \
    alsa-lib \
    atk \
    cups-libs \
    dbus \
    libx11 \
    libxcomposite \
    libxcursor \
    libxdamage \
    libxext \
    libxfixes \
    libxi \
    libxrandr \
    libxrender \
    libxtst \
    nss \
    chromium \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Configurar Puppeteer para usar Chromium instalado por apk
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Establece el directorio de trabajo
WORKDIR /usr/src/app


# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

#ENV NODE_TLS_REJECT_UNAUTHORIZED=0

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

# Usa una imagen base oficial de Node.js
FROM node:22-alpine


RUN apt-get update && apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    xdg-utils \
    fonts-liberation \
    libnss3 \
    lsb-release \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

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

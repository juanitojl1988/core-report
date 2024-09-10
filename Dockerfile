# Usa una imagen base oficial de Node.js
FROM node:22-alpine

# Establece el directorio de trabajo
WORKDIR /usr/src/app


# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Instala las dependencias
RUN npm install --production

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

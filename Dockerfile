# Usa una imagen base oficial de Node.js
FROM node:v20.13.1

# Crea un directorio para la aplicación
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos del proyecto
COPY . .

# Construye la aplicación
RUN npm run build

# Expon el puerto en el que la aplicación escuchará
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD [ "npm", "run", "start:prod" ]
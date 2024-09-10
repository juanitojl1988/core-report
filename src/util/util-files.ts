import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileManager {


    async saveFile(reportName: string, fileBuffer: Buffer): Promise<string> {
        try {
            const filePath = path.resolve(__dirname, '..', 'RepoReportes', reportName);

            // Asegura que el directorio exista
            this.ensureDirectoryExistence(filePath);

            // Guardar el archivo en el disco
            fs.writeFileSync(filePath, fileBuffer);
            console.log('Archivo guardado correctamente:', filePath);

            // Devuelve la ruta del archivo guardado
            return filePath;
        } catch (error) {
            console.error('Error al guardar el archivo:', error);
            // Lanza una excepción de NestJS si algo sale mal
            throw new InternalServerErrorException('No se pudo guardar el archivo.');
        }
    }

    private ensureDirectoryExistence(filePath: string): void {
        const dirname = path.dirname(filePath);
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true });
        }
    }

}
import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { envs } from 'src/config';

export class FileManager {

    private readonly PATH_REPO: string = envs.path_repo_reportes;

    generateRandomFileName(extension: string): string {
        const timestamp = Date.now(); // Obtiene la fecha y hora actuales en milisegundos
        const randomPart = Math.random().toString(36).substring(2, 8); // Genera una cadena aleatoria
        return `${timestamp}-${randomPart}.${extension}`; // Concatenar fecha, cadena aleatoria y extensión
    }

    async saveFile(fileBuffer: Buffer, extReport: string): Promise<string> {
        try {
            const reportName = "Reporte_".concat(this.generateRandomFileName(extReport));
            const filePath = path.join(__dirname, this.PATH_REPO);
            // Asegura que el directorio exista
            this.ensureDirectoryExistence(filePath);


            // Guardar el archivo en el disco
            fs.writeFileSync(path.join(filePath, reportName), fileBuffer);
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
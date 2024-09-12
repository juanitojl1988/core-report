import { InternalServerErrorException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { envs } from 'src/config';

export class FileManager {
    private readonly logger = new Logger('FileManager');
    private readonly PATH_REPO: string = envs.path_repo_reportes;

    generateRandomFileName(extension: string): string {
        const timestamp = Date.now(); // Obtiene la fecha y hora actuales en milisegundos
        const randomPart = Math.random().toString(36).substring(2, 8); // Genera una cadena aleatoria
        return `${timestamp}-${randomPart}.${extension}`; // Concatenar fecha, cadena aleatoria y extensión
    }

    async saveFile(fileBuffer: Buffer, extReport: string): Promise<any> {
        try {
            const reportName = "Reporte_".concat(this.generateRandomFileName((extReport === 'xlsx2' ? 'xlsx' : extReport)));

            this.ensureDirectoryExistence(this.PATH_REPO);
            fs.writeFileSync(path.join(this.PATH_REPO, reportName), fileBuffer);
            console.log('Archivo guardado correctamente:', this.PATH_REPO);

            const filePath = path.join(this.PATH_REPO, reportName);
            const stats = fs.statSync(filePath);

            const fileSizeInBytes = stats.size;
            const fileExtension = path.extname(filePath).replace('.','');

            return {
                pathFile: path.join(this.PATH_REPO, reportName),
                sizeBytes: fileSizeInBytes,
                fileExtension: fileExtension
            };
        } catch (error) {
            this.logger.error('Error al guardar el archivo:', error);
            // Lanza una excepción de NestJS si algo sale mal
            throw new InternalServerErrorException('No se pudo guardar el archivo, detalle' + error);
        }
    }

    private ensureDirectoryExistence(filePath: string): void {
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }
    }

}
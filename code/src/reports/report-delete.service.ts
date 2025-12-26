import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import { envs } from "src/config";
import * as fs from 'fs';
import { Cron } from "@nestjs/schedule";

@Injectable()
export class ReportDeleteFilesService {

    private readonly logger = new Logger('ReportDeleteFilesService');
    private readonly folderPath = envs.path_repo_reportes;  // Ruta a la carpeta que deseas monitorear

    constructor() {
    }

    @Cron(envs.cron_expression_delete_reportes) // Se ejecuta a la medianoche todos los días
    deleteOldFiles() {
        try {

            this.logger.log(`Inicia la eliminacion de Reportes y plantillas no usados en: ${this.folderPath}`);

            if (!fs.existsSync(this.folderPath)) {
                this.logger.warn(`La carpeta no existe: ${this.folderPath}`);
                return;
            }

            const files = fs.readdirSync(this.folderPath);
            this.logger.log(`Total de archivos encontrados: ${files.length}`);

            const currentDate = new Date();
            const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;

            files.forEach(file => {
                const filePath = path.join(this.folderPath, file);
                const stats = fs.statSync(filePath);
                const fileCreationDate = new Date(stats.ctime);
                const timeDifference = currentDate.getTime() - fileCreationDate.getTime();

                const daysOld = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

                if (timeDifference > oneMonthInMilliseconds) {
                    try {
                        fs.unlinkSync(filePath);  // Eliminar el archivo
                        this.logger.log(`[ELIMINADO] Archivo: ${file} - Antigüedad: ${daysOld} días (Creado: ${fileCreationDate.toISOString()})`);
                    } catch (unlinkError) {
                        this.logger.error(`Error eliminando archivo: ${file} - ${unlinkError.message}`);
                    }
                } else {
                    this.logger.log(`[CONSERVADO] Archivo: ${file} - Antigüedad: ${daysOld} días. (Limite: 30 días)`);
                }
            });
        } catch (readDirError) {
            this.logger.error(`Error procesando la carpeta: ${this.folderPath} - ${readDirError.message}`);
        }
    }
}

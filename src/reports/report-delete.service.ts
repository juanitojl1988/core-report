import { Injectable, Logger } from "@nestjs/common";
import path from "path";
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

            this.logger.log('Inicia la eliminacion de Reportes y plantillas no usandos');
            const files = fs.readdirSync(this.folderPath);
            const currentDate = new Date();
            files.forEach(file => {
                const filePath = path.join(this.folderPath, file);
                const stats = fs.statSync(filePath);
                const fileCreationDate = new Date(stats.ctime);
                const timeDifference = currentDate.getTime() - fileCreationDate.getTime();
                const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;
                if (timeDifference > oneMonthInMilliseconds) {
                    try {
                        fs.unlinkSync(filePath);  // Eliminar el archivo
                        this.logger.log(`Archivo eliminado: ${file} - Fecha creación: ${fileCreationDate}`);
                    } catch (unlinkError) {
                        this.logger.error(`Error eliminando archivo: ${file} - ${unlinkError.message}`);
                    }
                }
            });
        } catch (readDirError) {
            this.logger.error(`Error leyendo la carpeta: ${this.folderPath} - ${readDirError.message}`);
        }
    }
}

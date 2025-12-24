import * as path from 'path';
import axios from 'axios';
import { envs } from 'src/config';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { Logger } from '@nestjs/common';

export class FileDownloader {
    private readonly PATH_REPO: string = envs.path_repo_reportes;
    private readonly logger = new Logger('FileDownloader');

    async downloadFile(url: string, ext: string): Promise<string> {
        try {

            const fileName = "template_" + this.generateRandomFileName() +"."+ ext;
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            await mkdir(dirname(this.PATH_REPO), { recursive: true });
            const filePathFinal = path.join(this.PATH_REPO, fileName);
            await writeFile(filePathFinal, response.data);
            return filePathFinal;
        } catch (error) {
            this.logger.error("Error al Descargar", error.message);
            throw new Error('Error al descargar el archivo: ' + error.message);
        }
    }


    private generateRandomFileName(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}
import * as fs from 'fs';
import * as path from 'path';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { envs } from 'src/config';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

export class FileDownloader {
    private readonly PATH_REPO: string = envs.path_repo_reportes;


    async downloadFile(url: string, ext: string): Promise<string> {
        try {
            const fileName = "template_" + this.generateRandomFileName() + ext;
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const filePath = path.join(__dirname, this.PATH_REPO);
            await mkdir(dirname(filePath), { recursive: true });
            const filePathFinal = path.join(this.PATH_REPO, fileName);
            await writeFile(filePathFinal, response.data);
            return filePathFinal;
        } catch (error) {
            throw new Error('Error al descargar el archivo: ' + error.message);
        }
    }


    private generateRandomFileName(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}
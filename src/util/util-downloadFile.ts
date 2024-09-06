import * as fs from 'fs';
import * as path from 'path';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

export class FileDownloader {
    private readonly downloadDir: string;



    constructor(private readonly httpService: HttpService) {
        this.downloadDir = path.join(__dirname,'..', 'temp_templates');
        this.createDownloadDir();
    }

    private createDownloadDir() {
        if (!fs.existsSync(this.downloadDir)) {
            fs.mkdirSync(this.downloadDir);
        }
    }

    async downloadFile(url: string, ext?: string): Promise<string> {
        const fileName = "template_" + this.generateRandomFileName() + ext;
        const filePath = path.join(this.downloadDir, fileName);
        const response = await lastValueFrom(this.httpService.get(url, { responseType: 'stream' }));

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            writer.on('finish', () => resolve(filePath));
            writer.on('error', (error) => reject(new Error('Error writing file: ' + error.message)));
        });
    }

    private generateRandomFileName(): string {
        return Math.random().toString(36).substring(2, 15);
    }
}
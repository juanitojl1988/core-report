import { Injectable, Logger } from '@nestjs/common';
import * as jsreport from 'jsreport';

@Injectable()
export class JsReportService {
    private jsreportInstance;
    private readonly logger = new Logger('JsReportService');

    constructor() {
        this.jsreportInstance = jsreport();
        this.jsreportInstance.init().then(() => {

            this.jsreportInstance.options.chrome = {
                executablePath: '/usr/bin/chromium',
                launchOptions: {
                    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Agrega los argumentos necesarios
                },
                timeout: 60000 // Aumenta el timeout según sea necesario
            };
        }).catch((err) => {
            this.logger.error('Error al iniciar jsreport:', err);
        });
    }

    getInstance() {
        return this.jsreportInstance;
    }
}
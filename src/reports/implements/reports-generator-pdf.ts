import { Injectable } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import * as jsreport from 'jsreport';


@Injectable()
export class PdfReportGenerator implements ReportGenerator {
    private jsreportInstance;

    constructor() {
        this.jsreportInstance = jsreport();
        this.jsreportInstance.init();
    }

    async generate(data: Record<string, any>): Promise<Buffer> {
        return await this.jsreportInstance.render({
            template: {
                content: data.template,
                engine: 'handlebars',
                recipe: 'chrome-pdf',
                chrome: {
                    printBackground: true,
                },
            },
            data,
        }).then(response => response.content);
    }
}

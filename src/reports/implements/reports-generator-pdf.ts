import { Injectable } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import { QueryService } from 'src/query/query.service';
import { JsReportService } from 'src/jsreport/jsreport.service';


@Injectable()
export class PdfReportGenerator implements ReportGenerator {


    constructor(private readonly queryService: QueryService, private readonly jsReportService: JsReportService) { }


    async generate(data: Record<string, any>): Promise<Buffer> {

        const jsreportInstance = this.jsReportService.getInstance();
        return await jsreportInstance.render({
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

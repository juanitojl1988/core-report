import { Injectable, Logger } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import { QueryService } from 'src/query/query.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { FileDownloader } from 'src/util/util-downloadFile';
import { JsReportService } from 'src/jsreport/jsreport.service';

@Injectable()
export class ExcelReportGenerator implements ReportGenerator {
    private readonly logger = new Logger('ExcelReportGenerator');
    constructor(private readonly queryService: QueryService, private readonly jsReportService: JsReportService) { }


    async generate(createReportDto: CreateReportDto): Promise<Buffer> {
        const { template, query, templateIsFile, extTemplate, templeteIsDefaul } = createReportDto;
        let templateFinal = null;

        if (templateIsFile) {
            //descargo la plantilla
            templateFinal = await new FileDownloader().downloadFile(template, extTemplate);
            this.logger.log('Ruta Plantilla:', templateFinal);
        } else
            templateFinal = template;

        //obtengo la data de las consultas definidas
        let data: Record<string, any> = {};
        data = await this.queryService.executeQueryAndFormatData(query);
        data = {
            ...data,
            ...(createReportDto.data || {})
        };
        //define si el excel viene para crear la plantilla dinamica
        if (templeteIsDefaul === 'si')
            templateFinal = await this.generateDynamicExcelTemplate(data);
        else
            templateFinal = Buffer.from(template, 'base64').toString('utf-8');


        this.logger.log('Plantilla para Generar Reporte:', templateFinal);

        //genero el reporte con jsreport    
        try {
            const jsreportInstance = this.jsReportService.getInstance();
            const response = await jsreportInstance.render({
                template: this.defineTemplate(templateFinal, templateIsFile),
                data,
                options: {
                    timeout: 600000000 // Aumenta el timeout a 60 segundos
                }
            });
            return response.content;
        } catch (err) {
            this.logger.error('Error al generar el reporte ExcelReportGenerator:', err);
            throw err;
        }
    }

    async generateDynamicExcelTemplate(dataResult: Record<string, any>): Promise<String> {

        const data = dataResult['list'];
        if (!data || data.length === 0) {
            throw new Error('No se proporcionaron datos para generar la plantilla.');
        }
        const columns = Object.keys(data[0]);
        const tableHeader = `${columns.map(column => `<th>${column.toUpperCase()}</th>`).join('')}`;
        const tableRows = `${columns.map(column => `<td>{{${column}}}</td>`).join('')}`;
        return `<style>
    td, th {
        white-space: nowrap; 
        max-width: 300px;
        overflow: hidden; 
        text-overflow: ellipsis; 
    }
</style>
</style>
    <table>
        <tr>
            ${tableHeader}
        </tr>
        {{#each list}}
            <tr>
                 ${tableRows}
            </tr>
        {{/each}}
    </table>`;
    }

    private defineTemplate(content: string, isTempleteFile: boolean) {

        if (isTempleteFile)
            return {
                content: content,
                engine: 'handlebars',
                recipe: 'html-to-xlsx',
                htmlToXlsx: {
                    waitForJS: false
                }
            };

        else
            return {
                content: content,
                engine: 'handlebars',
                recipe: 'html-to-xlsx',
                htmlToXlsx: {
                    waitForJS: false
                }
            };
    }
}


import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import * as jsreport from 'jsreport';
import { QueryService } from 'src/query/query.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { FileDownloader } from 'src/util/util-downloadFile';
import * as fs from 'fs';

@Injectable()
export class ExcelReportGenerator implements ReportGenerator {
    private readonly logger = new Logger('ExcelReportGenerator');
    private jsreportInstance;

    constructor(private readonly queryService: QueryService,) {
        this.jsreportInstance = jsreport();
        this.jsreportInstance.init().catch((err) => {
            this.logger.error('Error al iniciar jsreport:', err);
        });
    }

    async generate(createReportDto: CreateReportDto): Promise<Buffer> {
        const { template, haveData, query, templateIsFile, extTemplate } = createReportDto;
        let templateFinal = null;
        if (templateIsFile) {
            //descargo la plantilla
            templateFinal = await new FileDownloader().downloadFile(template, extTemplate);
            this.logger.log('Ruta Plantilla:', templateFinal);
        } else
            templateFinal = template;
        //obtengo la data de las consultas definidas
        let data: Record<string, any> = {};
        if (haveData === 'no')
            data = await this.queryService.executeQueryAndFormatData(query);
        else
            data = createReportDto.data;

        //genero el reporte con jsreport    
        try {
            const response = await this.jsreportInstance.render({
                template: this.defineTemplate(templateFinal, templateIsFile),
                data,
            });
            return response.content;
        } catch (err) {
            this.logger.error('Error al generar el reporte ExcelReportGenerator:', err);
            throw new InternalServerErrorException('Error al generar el reporte ExcelReportGenerator:' + err.message);
        }
    }

    private defineTemplate(content: string, isTempleteFile: boolean) {

        if (isTempleteFile)
            return {
                content: content,
                engine: 'handlebars',
                recipe: 'html-to-xlsx',
            };

        else
            return {
                content: content,
                engine: 'handlebars',
                recipe: 'html-to-xlsx',
            };
    }
}


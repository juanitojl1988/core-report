import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import * as jsreport from 'jsreport';
import { CreateReportDto } from '../dto/create-report.dto';
import { FileDownloader } from 'src/util/util-downloadFile';
import { QueryService } from 'src/query/query.service';
import * as fs from 'fs';

@Injectable()
export class DocxReportGenerator implements ReportGenerator {
    private readonly logger = new Logger('DocxReportGenerator');
    private jsreportInstance;

    constructor(private readonly queryService: QueryService,) {
        this.jsreportInstance = jsreport();
        this.jsreportInstance.init().catch((err) => {
            this.logger.error('Error al iniciar jsreport:', err);
        });
    }

    async generate(createReportDto: CreateReportDto): Promise<Buffer> {
        const { template, haveData, query, templateIsFile, extTemplate } = createReportDto;
        if (!templateIsFile) {
            this.logger.error("Este Tipo de Reporte solo permite plantilla de tipo Archivo");
            throw new InternalServerErrorException("Este Tipo de Reporte solo permite plantilla de tipo Archivo");
        }
        //descargo la plantilla
        const pathTemplete = await new FileDownloader().downloadFile(template, extTemplate);
        this.logger.log('Ruta Plantilla:', pathTemplete);

        //obtengo la data de las consultas definidas
        let data: Record<string, any> = {};
        if (haveData === 'no')
            data = await this.queryService.executeQueryAndFormatData(query);
        else
            data = createReportDto.data;

        //genero el reporte con jsreport    
        try {
            const response = await this.jsreportInstance.render({
                template: {
                    recipe: 'docx',
                    engine: 'handlebars',
                    docx: {
                        templateAsset: {
                            content: await fs.promises.readFile(pathTemplete, 'base64'),  // Base DOCX en base64
                            encoding: 'base64'
                        }
                    }
                },
                data,
            });
            return response.content;
        } catch (err) {
            this.logger.error('Error al generar el reporte DocxReportGenerator:', err);
            throw new InternalServerErrorException('Error al generar el reporte DocxReportGenerator:' + err.message);
        }
    }
}


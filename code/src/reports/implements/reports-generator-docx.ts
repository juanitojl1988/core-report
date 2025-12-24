import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import { CreateReportDto } from '../dto/create-report.dto';
import { FileDownloader } from 'src/util/util-downloadFile';
import { QueryService } from 'src/query/query.service';
import * as fs from 'fs';
import { JsReportService } from 'src/jsreport/jsreport.service';

@Injectable()
export class DocxReportGenerator implements ReportGenerator {
    private readonly logger = new Logger('DocxReportGenerator');


    constructor(private readonly queryService: QueryService, private readonly jsReportService: JsReportService) { }

    async generate(createReportDto: CreateReportDto): Promise<Buffer> {
        const { template, haveData, query, templateIsFile, extTemplate } = createReportDto;
        if (!templateIsFile) {
            this.logger.error("Este Tipo de Reporte solo permite plantilla de tipo Archivo");
            throw new BadRequestException("Este Tipo de Reporte solo permite plantilla de tipo Archivo");
        }

        if (templateIsFile && !(extTemplate === 'doc' || extTemplate === 'docx')) {
            throw new BadRequestException('Debe especificar un templete  con extensión .doc o .docx');
        }

        //descargo la plantilla
        const pathTemplete = await new FileDownloader().downloadFile(template, extTemplate);
        this.logger.log('Ruta Plantilla: ' + pathTemplete);

        //obtengo la data de las consultas definidas
        let data: Record<string, any> = {};
        if (haveData === 'no')
            data = await this.queryService.executeQueryAndFormatData(query);
        else
            data = createReportDto.data;

        //genero el reporte con jsreport    
        try {
            const jsreportInstance = this.jsReportService.getInstance();
            const response = await jsreportInstance.render({
                template: {
                    recipe: 'docx',
                    engine: 'handlebars',
                    docx: {
                        templateAsset: {
                            content: await fs.promises.readFile(pathTemplete, 'base64'),  // Base DOCX en base64
                            //content: await fs.promises.readFile('D:\\PROJECT_JP\\ResultaReport\\list.docx', 'base64'),

                            encoding: 'base64'
                        }
                    }
                },
                data,
            });
            return response.content;
        } catch (err) {
            this.logger.error('Error al generar el reporte DocxReportGenerator:', err);
            throw err;
        }
    }
}


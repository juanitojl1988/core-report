import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import { QueryService } from 'src/query/query.service';
import { JsReportService } from 'src/jsreport/jsreport.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { DocxReportGenerator } from './reports-generator-docx';


@Injectable()
export class PdfReportGenerator implements ReportGenerator {
    private readonly logger = new Logger('PdfReportGenerator');

    constructor(
        private readonly queryService: QueryService,
        private readonly jsReportService: JsReportService,
        private readonly docxReportGenerator: DocxReportGenerator) { }

    private async generateInBaseTemplete(createReportDto: CreateReportDto): Promise<Buffer> {
        const docxBuffer = await this.docxReportGenerator.generate(createReportDto);
        try {
            // Convertir el DOCX a PDF usando jsreport
            const jsreportInstance = this.jsReportService.getInstance();
            const response = await jsreportInstance.render({
                template: {
                    content: docxBuffer.toString('base64'), // El DOCX como base64
                    engine: 'handlebars',
                    recipe: 'docx-to-pdf', // Receta de jsreport para convertir a PDF
                }
            });
            return response.content;
        } catch (err) {
            this.logger.error('Error al generar el reporte generateInBaseTemplete:', err);
            throw new InternalServerErrorException('Error al generar el reporte generateInBaseTemplete:' + err.message);
        }
    }

    async generate(createReportDto: CreateReportDto): Promise<Buffer> {
        const { template, query, templateIsFile } = createReportDto;

        if (templateIsFile) {
            return this.generateInBaseTemplete(createReportDto);
        }
        const decodedTemplate = Buffer.from(template, 'base64').toString('utf-8');
        this.logger.log('Plantilla para Generar Reporte:', decodedTemplate);
        //obtengo la data de las consultas definidas
        let data: Record<string, any> = {};
        data = await this.queryService.executeQueryAndFormatData(query);
        data = {
            ...data,
            ...(createReportDto.data || {})
        };
        try {
            const jsreportInstance = this.jsReportService.getInstance();
            const response = await jsreportInstance.render({
                template: {
                    content: decodedTemplate,
                    engine: 'handlebars',
                    recipe: 'chrome-pdf',
                    chrome: {
                        printBackground: true,
                        marginTop: '1cm',
                        marginBottom: '1cm',
                        marginLeft: '1cm',
                        marginRight: '1cm',
                        printHeaderFooter: false
                    }
                },
                data,
            });
            return response.content;
        } catch (err) {
            this.logger.error('Error al generar el reporte PdfReportGenerator:', err);
            throw err;
        }
    }
}

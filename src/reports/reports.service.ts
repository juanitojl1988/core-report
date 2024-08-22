import { Injectable } from '@nestjs/common';
import * as jsreport from 'jsreport';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  private jsreportInstance;

  constructor() {
    this.jsreportInstance = jsreport();
    this.jsreportInstance.init().catch((err) => {
      console.error('Error al iniciar jsreport:', err);
    });
  }

  async generateReport(createReportDto: CreateReportDto): Promise<Buffer> {
    try {
      const { template, type, data, images } = createReportDto;
      let recipe;
      switch (type) {
        case 'pdf':
          recipe =  'chrome-pdf';//'html-to-pdf';
          break;
        case 'docx':
          recipe = 'html-to-docx';
          break;
        case 'xlsx':
          recipe = 'html-to-xlsx';
          break;
        default:
          throw new Error('Formato no soportado');
      }

      const response = await this.jsreportInstance.render({
        template: {
          content: template,
          engine: 'handlebars',
          recipe: recipe,
        },
        data: {
          ...data,
          images: images || {}, // Pasa las imágenes al contexto del reporte
        },
      });

      return response.content;
    } catch (err) {
      console.error('Error al generar el reporte:', err);
      throw err;
    }
  }
}

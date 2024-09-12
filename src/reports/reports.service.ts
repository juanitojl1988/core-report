import { Inject, Injectable, Logger } from '@nestjs/common';
import { ReportGenerator } from './interfaces/reports-generator';
import { PdfReportGenerator } from './implements/reports-generator-pdf';
import { DocxReportGenerator } from './implements/reports-generator-docx';
import { ExcelReportGenerator } from './implements/reports-generator-excel';
import { CreateReportDto } from './dto/create-report.dto';
import { ExcelBigDataReportGenerator } from './implements/reports-generador-excel-bigdata';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger('ReportsService');


  constructor(
    private readonly pdfGenerator: PdfReportGenerator,
    private readonly docxGenerator: DocxReportGenerator,
    private readonly excelGenerator: ExcelReportGenerator,
    private readonly excelBigDataReportGenerator: ExcelBigDataReportGenerator,
  ) {
  }

  async generateReport(createReportDto: CreateReportDto): Promise<Buffer> {
    let generator: ReportGenerator;
    switch (createReportDto.type) {
      case 'pdf':
        generator = this.pdfGenerator;
        break;
      case 'docx':
        generator = this.docxGenerator;
        break;
      case 'xlsx':
        generator = this.excelGenerator;
        break;
      case 'xlsx2':
        generator = this.excelBigDataReportGenerator;
        break;
      default:
        throw new Error('Formato no soportado');
    }
    return generator.generate(createReportDto);
  }


}

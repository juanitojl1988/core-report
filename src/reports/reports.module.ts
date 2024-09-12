import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { QueryModule } from 'src/query/query.module';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ReportDeleteFilesService } from './report-delete.service';
import { ReportsController } from './report-controller';
import { PdfReportGenerator } from './implements/reports-generator-pdf';
import { ExcelReportGenerator } from './implements/reports-generator-excel';
import { JsReportModule } from 'src/jsreport/jsreport.module';
import { DocxReportGenerator } from './implements/reports-generator-docx';
import { ExcelBigDataReportGenerator } from './implements/reports-generador-excel-bigdata';

@Module({
  imports: [JwtModule.register({
    secret: 'your-secret-key',
    signOptions: { expiresIn: '1h' },
  }), QueryModule, AuthModule, HttpModule, JsReportModule],
  controllers: [ReportsController],
  exports: [ReportsService],
  providers: [ReportsService,ExcelBigDataReportGenerator, ReportDeleteFilesService, PdfReportGenerator, ExcelReportGenerator, DocxReportGenerator],
})
export class ReportsModule { }

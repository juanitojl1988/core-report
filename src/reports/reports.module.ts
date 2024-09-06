import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { QueryModule } from 'src/query/query.module';
import { AuthModule } from 'src/auth/auth.module';
import { ReportsControllerPDF } from './reports-pdf.controller';
import { ReportsControllerExcel } from './reports-excel.controller';
import { ReportsControllerDocx } from './reports-docx.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [QueryModule,AuthModule,HttpModule],
  controllers: [ReportsControllerPDF,ReportsControllerExcel,ReportsControllerDocx],
  providers: [ReportsService],
})
export class ReportsModule {}


import { Module } from '@nestjs/common';
import { JsReportService } from './jsreport.service';

@Module({
  providers: [JsReportService],
  exports: [JsReportService],
})
export class JsReportModule { }
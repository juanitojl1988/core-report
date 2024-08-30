import { Body, Controller, Get, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryService } from 'src/query/query.service';
import { AuthGuard } from '@nestjs/passport';
import * as path from 'path';

@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger('ReportsController');

  constructor(private readonly reportsService: ReportsService, private readonly queryService: QueryService) { }

  @Get('download')
  async downloadExcel(@Res() res: Response) {
    const filePath = path.join(__dirname, '..','..', 'public', 'report.xlsx');

    // Configurar cabeceras para la descarga
    res.setHeader('Content-Disposition', 'inline; filename=report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Enviar el archivo como respuesta
    res.sendFile(filePath);
  }



  @Post('genereExcel')
  //@UseGuards(AuthGuard('api-key'))
  async genereExcel(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
    try {
      const { haveData, sql, parameter } = createReportDto;
      if (haveData === 'NO') {
        this.logger.log('Tiene definido obtener la data desde este Core');
        const result = this.queryService.executeQuery(sql,'',1);

      }
      const reportBuffer = await this.reportsService.generateReport(createReportDto);
      res.setHeader('Content-Disposition', `inline; filename="reporte.${createReportDto.type}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.send(reportBuffer);
    } catch (err) {
      this.logger.error('Error al generar el reporte:', err);
      res.status(500).send('Error al generar el reporte');
    }
  }


  @Post('generarReport')
  //@UseGuards(AuthGuard('api-key'))
  async generarReporte(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
    try {
      const { haveData, sql, parameter } = createReportDto;
      if (haveData === 'NO') {
        this.logger.log('Tiene definido obtener la data desde este Core');
        const result = this.queryService.executeQuery(sql,'',1);

      }
      const reportBuffer = await this.reportsService.generateReport(createReportDto);
      res.setHeader('Content-Disposition', `attachment; filename="reporte.${createReportDto.type}"`);
      res.setHeader('Content-Type', {
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }[createReportDto.type],);
      res.send(reportBuffer);
    } catch (err) {
      this.logger.error('Error al generar el reporte:', err);
      res.status(500).send('Error al generar el reporte');
    }
  }

  /* @Get('/generate-report')
  async generateReport(@Res() res: Response) {
    try {
      const data = [
        { name: 'Juan Pérez', age: 30 },
        { name: 'Maria López', age: 25 },
        { name: 'Carlos Gómez', age: 40 },
      ];

      const excelBuffer = await this.reportsService.generateReport({ data });

      res.setHeader('Content-Disposition', 'attachment; filename="reporte.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);
    } catch (err) {
      console.error('Error al generar el reporte:', err);
      res.status(500).send('Error al generar el reporte');
    }
  } */
}

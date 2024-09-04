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

 
  @Post('generarReport')
  //@UseGuards(AuthGuard('api-key'))
  async generarReporte(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
    try {
      const { haveData,data } = createReportDto;
      const resultsMap = new Map<string, any>();

      if (haveData === 'NO') {
        this.logger.log('Tiene definido obtener la data desde este Core');

        if (createReportDto.query) {
          for (const [key, query] of Object.entries(createReportDto.query)) {
            console.log(`Consulta ${key}:`, query.sql);
            console.log(`Consulta Count ${key}:`, query.sqlCount);
            const result = await this.queryService.executeQuery(query, 100);
            data[key] = result;
          }
        }
      }
      createReportDto.data=data;
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

  @Get('download')
  async downloadExcel(@Res() res: Response) {
    const filePath = path.join(__dirname, '..', '..', 'public', 'report.xlsx');

    // Configurar cabeceras para la descarga
    res.setHeader('Content-Disposition', 'inline; filename=report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Enviar el archivo como respuesta
    res.sendFile(filePath);
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

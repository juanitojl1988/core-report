import { Body, Controller, Get, Logger, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import * as fs from 'fs';
import { FileManager } from 'src/util/util-files';
import { JwtService } from '@nestjs/jwt';

@Controller('xlsx')
export class ReportsControllerExcel {
    private readonly logger = new Logger('ReportsControllerPDF');
    private fileManager: FileManager;

    constructor(
        private readonly reportsService: ReportsService,
        private readonly jwtService: JwtService
    ) {
        this.fileManager = new FileManager();
    }



    @Post('generateReport')
    // @UseGuards(AuthGuard('api-key'))
    async generateReport(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
        try {
            const reportBuffer = await this.reportsService.generateReportPdf(createReportDto);
            const reportName = "Reporte_".concat(this.generateRandomFileName(createReportDto.type));


            const filePath = await this.fileManager.saveFile(reportName, reportBuffer);
            const token = this.jwtService.sign({ filePath }, { expiresIn: '10m' });

            const downloadUrl = `http://tu-api-nest.com/reports/download?token=${token}`;
            return res.json({ downloadUrl, token, filePath });
        } catch (error) {
            this.logger.error("Error al generateReport, Error: " + error);
            throw error;
        }
    }


    @Get('download')
    async downloadReport(@Query('token') token: string, @Res() res: Response) {
        try {
            // Verificar y decodificar el token
            const decoded = this.jwtService.verify(token);
            const filePath = decoded.filePath;
            this.logger.log('Ruta del Archivo:', filePath);
            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                return res.status(404).send('Archivo no encontrado');
            }
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                    res.status(500).send('Error al descargar el archivo');
                }
            });
        } catch (error) {
            this.logger.error('Error al verificar el token o descargar el archivo:', error);
            res.status(403).send('Token inválido o expirado');
        }
    }


    @Post('download1')
    //@UseGuards(AuthGuard('api-key'))
    async downloadReport1(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
        try {
            const reportBuffer = await this.reportsService.generateReportPdf(createReportDto);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${createReportDto.nameReport}.xlsx"`,
                'Content-Length': reportBuffer.length,
            });
            res.end(reportBuffer);
        } catch (error) {
            this.logger.error("Error al downloadReport, Error: " + error);
            throw error;
        }
    }


    generateRandomFileName(extension: string): string {
        const timestamp = Date.now(); // Obtiene la fecha y hora actuales en milisegundos
        const randomPart = Math.random().toString(36).substring(2, 8); // Genera una cadena aleatoria
        return `${timestamp}-${randomPart}.${extension}`; // Concatenar fecha, cadena aleatoria y extensión
    }

    @Post('view')
    //@UseGuards(AuthGuard('api-key'))
    async viewReport(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
        try {
            const reportBuffer = await this.reportsService.generateReportPdf(createReportDto);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `inline; filename="${createReportDto.nameReport}.xlsx"`,
                'Content-Length': reportBuffer.length,
            });
            res.end(reportBuffer);
        } catch (error) {
            this.logger.error("Error al viewReport, Error: " + error)
            throw error;
        }
    }
}
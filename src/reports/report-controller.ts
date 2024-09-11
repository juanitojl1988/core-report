import { Body, Controller, Get, Logger, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FileManager } from 'src/util/util-files';
import * as fs from 'fs';

@Controller('')
export class ReportsController {
    private readonly logger = new Logger('ReportsController');
    private jwtService: any;
    constructor(private readonly reportsService: ReportsService) { }


    @Post('generateReport')
    //@UseGuards(AuthGuard('api-key'))
    async generateReport(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
        try {
            const reportBuffer = await this.reportsService.generateReport(createReportDto);
            const filePath = await new FileManager().saveFile(reportBuffer, createReportDto.type);
            const token = this.jwtService.sign({ filePath }, { expiresIn: '60m' });
            return res.json({ token, filePath });
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
}
import { Body, Controller, Get, InternalServerErrorException, Logger, NotFoundException, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FileManager } from 'src/util/util-files';
import * as fs from 'fs';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import path from 'path';

@Controller('')
export class ReportsController {
    private readonly logger = new Logger('ReportsController');

    constructor(private readonly reportsService: ReportsService,
        private readonly jwtService: JwtService) { }


    @Post('generateReport')
    // @UseGuards(AuthGuard('api-key'))
    async generateReport(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
        try {

            const startTime = process.hrtime();


            const reportBuffer = await this.reportsService.generateReport(createReportDto);
            const { pathFile, sizeBytes, fileExtension } = await new FileManager().saveFile(reportBuffer, createReportDto.type);
            const token = this.jwtService.sign({ pathFile }, { expiresIn: '60m' });

            const endTime = process.hrtime(startTime);
            const elapsedTimeInSeconds = endTime[0] + endTime[1] / 1e9;

            return res.json({ token, pathFile, sizeBytes, fileExtension, elapsedTimeInSeconds });
        } catch (error) {
            this.logger.error("Error al generateReport, Error: " + error);
            throw error;
        }
    }


    @Get('view')
    async viewReport(@Query('token') token: string, @Res() res: Response) {

        try {
            const decoded = this.jwtService.verify(token);

            const filePath = decoded.pathFile;
            this.logger.log('Ruta del Archivo: ' + filePath);

            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                this.logger.error('Archivo no encontrado, file: ' + filePath);
                throw new NotFoundException('Archivo no encontrado, file: ' + filePath);
            }

            // Obtener la extensión del archivo
            const fileExtension = path.extname(filePath).toLowerCase();

            // Definir el Content-Type y Content-Disposition basado en la extensión
            let contentType = 'application/octet-stream'; // Tipo por defecto para archivos binarios
            let contentDisposition = 'inline'; // Descarga por defecto

            switch (fileExtension) {
                case '.pdf':
                    contentType = 'application/pdf';
                    break;
                case '.xlsx':
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                case '.docx':
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    break;
            }

            // Establecer las cabeceras
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `${contentDisposition}; filename="${path.basename(filePath)}"`);

            // Enviar el archivo
            res.sendFile(filePath, (err) => {
                if (err) {
                    this.logger.error('Error al mostrar/descargar el archivo, Error: ' + err);
                    throw new InternalServerErrorException(err.message);
                }
            });

        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new InternalServerErrorException('El token ha expirado. Por favor, solicita uno nuevo.');
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }

    @Get('download')
    async downloadReport(@Query('token') token: string, @Res() res: Response) {

        try {
            const decoded = this.jwtService.verify(token);

            const filePath = decoded.pathFile;
            this.logger.log('Ruta del Archivo: ' + filePath);

            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                this.logger.error('Archivo no encontrado, file: ' + filePath);
                throw new NotFoundException('Archivo no encontrado, file: ' + filePath);
            }

            res.download(filePath, (err) => {
                if (err) {
                    this.logger.error('Error al descargar el archivo, Error: ' + err);
                    throw new InternalServerErrorException(err.message);
                }
            });

        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new InternalServerErrorException('El token ha expirado. Por favor, solicita uno nuevo.');
            } else {
                throw new InternalServerErrorException(error.message);
            }
        }
    }
}
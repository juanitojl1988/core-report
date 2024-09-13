import { Body, Controller, Get, InternalServerErrorException, Logger, NotFoundException, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { FileManager } from 'src/util/util-files';
import * as fs from 'fs';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

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
            throw new InternalServerErrorException("Error al generateReport, Error: " + error);
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
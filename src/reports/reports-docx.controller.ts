import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { QueryService } from 'src/query/query.service';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('docx')
export class ReportsControllerDocx {
    private readonly logger = new Logger('ReportsControllerDocx');
    constructor(private readonly reportsService: ReportsService, private readonly queryService: QueryService) { }

    @Post('download')
    //@UseGuards(AuthGuard('api-key'))
    async downloadReport(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
        try {
            const reportBuffer = await this.reportsService.generateReportOfTemplateDocx(createReportDto);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${createReportDto.nameReport}.docx"`,
                'Content-Length': reportBuffer.length,
            });
            res.end(reportBuffer);
        } catch (error) {
            this.logger.error("Error al downloadReport, Error: " + error.mensaje);
            throw error;
        }
    }


    @Post('view')
    //@UseGuards(AuthGuard('api-key'))
    async viewReport(@Body() createReportDto: CreateReportDto, @Res() res: Response) {
        try {
            const reportBuffer = await this.reportsService.generateReportOfTemplateDocx(createReportDto);
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `inline; filename="${createReportDto.nameReport}.docx"`,
                'Content-Length': reportBuffer.length,
            });
            res.end(reportBuffer);
        } catch (error) {
            this.logger.error("Error al viewReport, Error: " + error)
            throw error;
        }
    }
}
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import { CreateReportDto } from '../dto/create-report.dto';
import { QueryService } from 'src/query/query.service';
import { Workbook } from 'exceljs';

@Injectable()
export class ExcelBigDataReportGenerator implements ReportGenerator {

    private readonly logger = new Logger('ExcelBigDataReportGenerator');
    constructor(private readonly queryService: QueryService) { }

    async generate(createReportDto: CreateReportDto): Promise<Buffer> {
        const { query } = createReportDto;
        let moreData = true;
        let offset = 0;
        let limit = 100;
        let totalRows = 0;
        let index = 0;
        const sqlCount = query['list'].sqlCount;
        const sql = query['list'].sql;
        try {

            // const resultCount: { count: number }[] = await this.queryService.executeQueryOne(sqlCount);
            const resultCount: { count: number }[] = await this.queryService.executeQueryForBySqlAndParameter(null, null);
            this.logger.log(`Total Registros: ${resultCount[0]?.count}`);
            if (resultCount[0]?.count <= 0) {
                throw new InternalServerErrorException('No existen Registros para generar el reporte');
            }
            //generar el reporte por cada grupo
            const workbook = new Workbook();
            const worksheet = workbook.addWorksheet('Report');
            while (moreData) {
                const paginatedQuery = `${sql} LIMIT ${limit} OFFSET ${offset}`;
                //const result: any[] = await this.queryService.executeQueryOne(paginatedQuery);
                const result: any[] = await this.queryService.executeQueryForBySqlAndParameter(null, null);
                this.logger.log(`Registros Recuperados: ${result.length}, de limit: ${limit}, offset: ${offset}`);
                totalRows = totalRows + result.length;
                if (result.length < limit || totalRows >= resultCount[0]?.count) {
                    moreData = false; // No hay más datos si el resultado es menor que el límite o se han recuperado todos los registros
                }
                offset += limit;

                // Definir los encabezados dinámicamente usando los nombres de los campos
                if (index === 0) {
                    const headers = Object.keys(result[0]).map((field) => ({
                        header: field.toUpperCase(),
                        key: field,
                        width: 20,
                        // Ajusta el ancho si es necesario
                    }));
                    worksheet.columns = headers;

                    headers.forEach((header, index) => {
                        const cell = worksheet.getRow(1).getCell(index + 1);
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: '000000' }, // Fondo negro
                        };
                        cell.font = {
                            color: { argb: 'FFFFFF' }, // Texto blanco
                            bold: true,
                        };
                        cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Centramos el texto
                    });
                }

                result.forEach((row) => {
                    const rowData = Object.values(row).map((value) =>
                        value !== null && value !== undefined ? value.toString() : ''
                    );
                    worksheet.addRow(rowData);
                });
                index++;
            }
            const buffer = await workbook.xlsx.writeBuffer({ useSharedStrings: false });
            return Buffer.from(buffer);
        } catch (error) {
            this.logger.error('Error al generar el reporte ExcelReportGenerator:', error);
            throw new InternalServerErrorException('Error al generar el reporte ExcelReportGenerator:' + error.message);
        }
    }
}
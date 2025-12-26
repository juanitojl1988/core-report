import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReportGenerator } from '../interfaces/reports-generator';
import { CreateReportDto } from '../dto/create-report.dto';
import { QueryService } from 'src/query/query.service';
import * as ExcelJS from 'exceljs';
import { PassThrough } from 'stream';

@Injectable()
export class ExcelBigDataReportGenerator implements ReportGenerator {

    private readonly logger = new Logger('ExcelBigDataReportGenerator');

    constructor(private readonly queryService: QueryService) { }

    async generate(createReportDto: CreateReportDto): Promise<Buffer> {
        return await this.generateStreamedReport(createReportDto);
    }

    private async generateStreamedReport(createReportDto: CreateReportDto): Promise<Buffer> {
        const { query } = createReportDto;
        // Configuración de paginación optimizada para Big Data
        const LIMIT = 5000;
        let offset = 0;
        let processedRows = 0;
        let headersSet = false;

        const sqlCount = query.list[0].sqlCount;
        const parameter = query.list[0].parameter;
        const sql = query.list[0].sql;

        // 1. Obtener total de registros
        const resultCount: { count: number }[] = await this.queryService.executeQueryForBySqlAndParameter(sqlCount, parameter);
        const totalRecords = resultCount[0]?.count ? Number(resultCount[0].count) : 0;

        this.logger.log(`Iniciando generación de reporte BigData. Total Registros: ${totalRecords}`);

        if (totalRecords <= 0) {
            throw new NotFoundException('No existen Registros para generar el reporte');
        }

        // 2. Configurar Stream
        const stream = new PassThrough();
        const buffers: Buffer[] = [];
        stream.on('data', (chunk) => buffers.push(chunk));

        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
            stream: stream,
            useStyles: true,
            useSharedStrings: false // Crítico para optimizar memoria
        });

        const worksheet = workbook.addWorksheet('Report');

        // 3. Procesamiento por lotes
        try {
            while (processedRows < totalRecords) {
                const paginatedQuery = `${sql} LIMIT ${LIMIT} OFFSET ${offset}`;
                this.logger.debug(`Procesando lote: ${offset} - ${offset + LIMIT}`);

                const result: any[] = await this.queryService.executeQueryForBySqlAndParameter(paginatedQuery, parameter);

                if (!result || result.length === 0) break;

                // Definir cabeceras con el primer lote de datos
                if (!headersSet) {
                    const headers = Object.keys(result[0]).map((field) => ({
                        header: field.toUpperCase(),
                        key: field,
                        width: 30 // Ancho fijo razonable para evitar cálculos costosos
                    }));

                    worksheet.columns = headers;

                    // Estilizar cabecera (Fila 1)
                    // Nota: En streaming es mejor setear columnas y luego commitear la fila si se requiere estilo específico
                    const headerRow = worksheet.getRow(1);
                    headerRow.eachCell((cell) => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: '000000' },
                        };
                        cell.font = {
                            color: { argb: 'FFFFFF' },
                            bold: true,
                        };
                        cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    });
                    headerRow.commit();
                    headersSet = true;
                }

                // Agregar filas
                result.forEach((row) => {
                    const rowData = {};
                    worksheet.columns.forEach(col => {
                        const val = row[col.key];
                        rowData[col.key] = (val !== null && val !== undefined) ? val.toString() : '';
                    });
                    worksheet.addRow(rowData).commit(); // Commit por fila para liberar memoria
                });

                processedRows += result.length;
                offset += LIMIT;

                // Liberar referencia al resultado anterior
                // result = null; // No necesario en let
            }

            worksheet.commit();
            await workbook.commit();

            this.logger.log(`Reporte generado exitosamente. Total procesado: ${processedRows}`);

            // Esperar a que el stream termine
            return new Promise((resolve, reject) => {
                const checkFinished = () => {
                    resolve(Buffer.concat(buffers));
                };

                if (stream.writableFinished) {
                    checkFinished();
                } else {
                    stream.on('finish', checkFinished);
                    stream.on('end', checkFinished);
                }
                stream.on('error', (err) => reject(err));
            });

        } catch (error) {
            this.logger.error('Error generando reporte BigData', error);
            throw error;
        }
    }
}
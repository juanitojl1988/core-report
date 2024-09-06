import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { QueryDto } from 'src/reports/dto/query-report.dto';


@Injectable()
export class QueryService {
    private readonly logger = new Logger('QueryService');

    constructor(private readonly prisma: PrismaService) { }

    async executeQuery(query: QueryDto, limit: number) {
        const { sql, sqlCount } = query;
        let allData: any[] = [];
        let offset = 0;
        let moreData = true;

        this.logger.log(`SQL: ${sql}, SQL Count: ${sqlCount}`);

        try {
            const resultCount: { count: number }[] = await this.prisma.$queryRawUnsafe(sqlCount);
            this.logger.log(`total Registros: ${resultCount[0]?.count}`);
            while (moreData) {
                const paginatedQuery = `${sql} LIMIT ${limit} OFFSET ${offset}`;
                const result: any[] = await this.prisma.$queryRawUnsafe(paginatedQuery);
                this.logger.log(`Registros Recuperados: ${result.length}, de limit: ${limit}, offset: ${offset}`);
                allData = allData.concat(result);
                if (result.length < limit || allData.length >= resultCount[0]?.count) {
                    moreData = false; // No hay más datos si el resultado es menor que el límite o se han recuperado todos los registros
                }
                offset += limit;
            }
            return allData;
        } catch (error) {
            this.handlePrismaError(error); // Maneja el error de Prisma
            throw error;
        }
    }

    async executeQueryOne(query: QueryDto) {
        const { sql } = query;
        this.logger.log(`SQL: ${sql}`);
        try {
            const result: any[] = await this.prisma.$queryRawUnsafe(sql);
            this.logger.log(`Registros Recuperados: ${result.length}`);
            return result;
        } catch (error) {
            this.handlePrismaError(error); // Maneja el error de Prisma
            throw error;
        }
    }

    async selectFromTable(tableName: string, whereClause: string = '1=1') {
        const query = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
        const result = await this.prisma.$queryRawUnsafe(query);
        return result;
    }

    private handlePrismaError(error: any): void {
        if (error instanceof PrismaClientKnownRequestError) {
            throw new InternalServerErrorException(error.message); // Lanza una excepción con el mensaje de error de Prisma
        } else {
            throw new InternalServerErrorException('Error inesperado al procesar la consulta'); // Maneja otros errores
        }
    }

}
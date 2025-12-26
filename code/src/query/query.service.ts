import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { QueryDto } from 'src/reports/dto/query-report.dto';
import { QuerySectionDto } from 'src/reports/dto/create-report.dto';


@Injectable()
export class QueryService {
    private readonly logger = new Logger('QueryService');
    constructor(private readonly prisma: PrismaService) { }

    async executeQueryAndFormatData(query: QuerySectionDto) {
        if (!query || Object.keys(query).length <= 0) {
            return {};
        }
        const resultmyData: Record<string, any> = {};
        try {
            const promisesOne = (query.one || []).map(async (item) => {
                const result = await this.executeQueryOneResult(item);
                resultmyData[item.key] = result;
            });
            const promisesList = (query.list || []).map(async (item) => {
                const result = await this.executeQueryListResult(item);
                resultmyData[item.key] = result;
            });
            await Promise.all([...promisesOne, ...promisesList]);
            return resultmyData;
        } catch (error) {
            this.logger.error("Error al extractData: " + error.message);
            throw new InternalServerErrorException("Error al extractData: " + error.message);
        }
    }


    async executeQueryOneResult(query: QueryDto) {

        try {
            const result = await this.executeQueryForBySqlAndParameter(query.sql, query.parameter);
            this.logger.log(`Total Registros RecuperadosOne: ${result.length}, del key ${query.key}`);
            return result && result.length > 0 ? result[0] : {};
        } catch (error) {
            this.logger.error(`Error recuperando data para clave '${query.key}': ${error.message}`);
            return {};
        }
    }

    async executeQueryListResult(query: QueryDto) {
        try {
            const result = await this.executeQueryForBySqlAndParameter(query.sql, query.parameter);
            const lista = result || [];
            this.logger.log(`Total Registros RecuperadosOne: ${result.length}, del key ${query.key}`);
            return lista;
        } catch (error) {
            this.logger.error(`Error recuperando lista para clave '${query.key}': ${error.message}`);
            return [];
        }
    }


    async executeQuerySinPaginacion(query: QueryDto) {
        const { sql } = query;
        try {
            const result: any[] = await this.executeQueryForBySqlAndParameter(sql, query.parameter);
            this.logger.log(`Total Registros Recuperados: ${result.length}`);
            return result;
        } catch (error) {
            this.handlePrismaError(error); // Maneja el error de Prisma
            throw error;
        }
    }

    async executeQuery(query: QueryDto, limit: number) {
        const { sql, sqlCount } = query;
        let allData: any[] = [];
        let offset = 0;
        let moreData = true;
        try {
            const resultCount: { count: number }[] = await this.executeQueryForBySqlAndParameter(sqlCount, query.parameter);
            this.logger.log(`total Registros: ${resultCount[0]?.count}`);
            while (moreData) {
                const paginatedQuery = `${sql} LIMIT ${limit} OFFSET ${offset}`;
                const result: any[] = await this.executeQueryForBySqlAndParameter(paginatedQuery, query.parameter);
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

    async executeQueryForBySqlAndParameter(query: string, parameters: Record<string, any>) {
        try {
            let sqlCambiado = "";
            this.logger.log("QueryOriginal: " + query);
            sqlCambiado = this.replaceQueryParams(query, parameters);
            this.logger.log("QueryCambiado: " + sqlCambiado);

            const result: any[] = await this.prisma.$queryRawUnsafe(sqlCambiado);
            return result;
        } catch (error) {
            this.handlePrismaError(error); // Maneja el error de Prisma
            throw error;
        }
    }


    replaceQueryParams(query: string, parameters: Record<string, any>): string {
        if (!parameters || Object.keys(parameters).length === 0) {
            return query;
        }

        // Reemplaza cada parámetro en la consulta
        Object.keys(parameters).forEach(param => {
            const value = parameters[param];
            const regex = new RegExp(`:${param}\\b`, 'g');
            if (Array.isArray(value)) {
                // Si el valor es un array, formatea los valores como una lista para el IN
                const formattedArray = value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
                query = query.replace(regex, `${formattedArray}`);
            } else if (typeof value === 'string') {
                // Si el valor es una cadena, escapar con comillas simples
                query = query.replace(regex, `'${value}'`);
            } else if (typeof value === 'number') {
                // Si el valor es numérico (entero o decimal), no usar comillas
                query = query.replace(regex, String(value));
            } else if (typeof value === 'boolean') {
                // Si el valor es booleano, convertirlo a 1 (true) o 0 (false)
                query = query.replace(regex, value ? 'true' : 'false');
            } else if (value === null || value === undefined) {
                // Si el valor es null o undefined, usar NULL en SQL
                query = query.replace(regex, 'NULL');
            } else {
                throw new Error(`Tipo de valor no soportado para el parámetro: ${param}`);
            }
        });
        return query;
    }


    private handlePrismaError(error: any): void {
        if (error instanceof PrismaClientKnownRequestError) {
            throw new InternalServerErrorException(error.message); // Lanza una excepción con el mensaje de error de Prisma
        } else {
            throw new InternalServerErrorException('Error inesperado al procesar la consulta'); // Maneja otros errores
        }
    }

}
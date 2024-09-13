import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { QueryDto } from 'src/reports/dto/query-report.dto';


@Injectable()
export class QueryService {
    private readonly logger = new Logger('QueryService');
    private readonly TYPE_QUERY_LIST: string = 'list';
    private readonly TYPE_QUERY_ONE: string = 'one';
    private readonly LIMIT_GROUP: number = 100;

    constructor(private readonly prisma: PrismaService) { }

    async executeQueryAndFormatData(query: Record<string, QueryDto>) {
        if (!query || Object.keys(query).length <= 0) {
            return {};
        }
        const myData: Record<string, any> = {};
        try {
            //Extracion de data una fila
            const queryOne = query[this.TYPE_QUERY_ONE];
            if (queryOne) {
                const dataOne = await this.executeQueryForBySqlAndParameter(queryOne.sql, queryOne.parameter);
                myData[this.TYPE_QUERY_ONE] = dataOne[0];
            }

            //Extracion de data varias filas
            const queryList = query[this.TYPE_QUERY_LIST];
            if (queryList) {
                const dataList = await this.executeQuery(queryList, this.LIMIT_GROUP);
                myData[this.TYPE_QUERY_LIST] = dataList;
            }
            return myData;
        } catch (error) {
            this.logger.error("Error al extractData: " + error.message);
            throw new InternalServerErrorException("Error al extractData: " + error.message);
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
            this.logger.log(`Registros Recuperados: ${result.length}`);
            return result;
        } catch (error) {
            this.logger.error(`Error al realizar la consulta: ${error.message}`);
            throw error;
        }
    }


    replaceQueryParams(query: string, parameters: Record<string, any>): string {

       // this.logger.log(`55555: ${parameters}`);

        if (!parameters || Object.keys(parameters).length === 0) {
            return query;
        }

        // Reemplaza cada parámetro en la consulta
        Object.keys(parameters).forEach(param => {
            const value = parameters[param];
            const regex = new RegExp(`:${param}`, 'g');

            if (Array.isArray(value)) {
                // Si el valor es un array, formatea los valores como una lista para el IN
                const formattedArray = value.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
                query = query.replace(regex, `(${formattedArray})`);
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
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class QueryService {

    private readonly logger = new Logger('QueryService');

    constructor(@InjectConnection() private readonly connection: Connection) { }


    async executeQuery(query: string, parameters: Record<string, any> = []): Promise<any[]> {
        // Validar y sanitizar la consulta para evitar inyecciones SQL

        this.logger.log('Query a ejecutar: ' + query);
        this.logger.log('Parametros: ' + parameters);

        if (!this.isValidQuery(query)) {
            throw new InternalServerErrorException('Invalid query');
        }

        try {
            // Ejecutar la consulta SQL cruda
            const result = await this.connection.query(query, null);
            this.logQueryResult(result);
            return result;
        } catch (error) {
            throw new InternalServerErrorException(`Query execution failed: ${error.message}`);
        }
    }

    private logQueryResult(result: any[]): void {
        if (result.length === 0) {
            console.log('No results found.');
            return;
        }

        // Obtener las claves de las columnas del primer objeto
        const columns = Object.keys(result[0]);

        // Imprimir encabezados de columna
        console.log('Columns:', columns.join(', '));

        // Iterar sobre cada fila y cada columna
        result.forEach((row, index) => {
            console.log(`Row ${index + 1}:`);
            columns.forEach(column => {
                console.log(`  ${column}: ${row[column]}`);
            });
        });
    }

    private isValidQuery(query: string): boolean {
        // Implementa validación básica para prevenir inyecciones SQL
        // Puedes ampliar esto según tus necesidades
        return !query.toLowerCase().includes('drop') && !query.toLowerCase().includes('truncate');
    }

}
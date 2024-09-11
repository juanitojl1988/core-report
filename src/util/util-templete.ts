import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class UtilTemplate {


    public getDynamicColumns(data: any[]) {
        if (data.length === 0) {
            return []; // Retorna un arreglo vacío si no hay datos
        }
        return Object.keys(data[0]).map(columnName => {
            // Asumiendo que todos los datos son del mismo tipo, se puede personalizar según sea necesario
            const columnType = this.getDataType(data[0][columnName]);
            return { column_name: columnName, data_type: columnType };
        });
    }

    public getDataType(value: any): string {
        // Definir la lógica para determinar el tipo de dato
        if (typeof value === 'string') return 'text';
        if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'decimal';
        if (value instanceof Date) return 'date';
        return 'text'; // Por defecto
    }



    private buildHtmlTable(columns: { column_name: string; data_type: string }[], data: any[]) {
        let html = `<table style="border-collapse: collapse; width: auto; table-layout: auto;">
                  <thead>
                    <tr style="background-color: #f2f2f2; font-weight: bold;">`; // Estilo para la cabecera

        // Encabezados de la tabla
        columns.forEach(col => {
            html += `<th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${col.column_name} (${col.data_type})</th>`;
        });

        html += `</tr>
              </thead>
              <tbody>`;

        // Filas de la tabla
        data.forEach(row => {
            html += `<tr>`;
            columns.forEach(col => {
                html += `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${row[col.column_name]}</td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table>`;
        return html;
    }

}

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';


@Injectable()
export class QueryService {

    private readonly logger = new Logger('QueryService');

    constructor(private readonly prisma: PrismaService) { }


    async executeQuery(query: string, params: any[] = []) {
        const result = await this.prisma.$queryRaw(query, ...params);
        return result;
    }

    async selectFromTable(tableName: string, whereClause: string = '1=1') {
        const query = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
        const result = await this.prisma.$queryRawUnsafe(query);
        return result;
    }

}
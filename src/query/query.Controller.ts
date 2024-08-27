import { Body, Controller, Get, Logger, Post, Query, Res } from '@nestjs/common';
import { QueryService } from './query.service';


@Controller('reports')
export class QueryController {
  private readonly logger = new Logger('ReportsController');

  constructor(private readonly queryService: QueryService) { }

  @Get('execute')
  async executeQuery(
    @Query('query') query: string,
    @Query('params') params: string[],
  ) {
    const result = await this.queryService.executeQuery(query, params);
    return { result };
  }

  @Get('select')
  async selectFromTable(
    @Query('table') tableName: string,
    @Query('where') whereClause: string,
  ) {
    const result = await this.queryService.selectFromTable(tableName, whereClause);
    return { result };
  }

}
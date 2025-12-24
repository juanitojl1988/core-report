import { Body, Controller, Get, Logger, Post, Query, Res } from '@nestjs/common';
import { QueryService } from './query.service';


@Controller('querys')
export class QueryController {
  private readonly logger = new Logger('ReportsController');

  constructor(private readonly queryService: QueryService) { }

 /*  @Post('query')
  async executeQuery(@Body() body: { query: string; countQuery: string }) {
    const { query, countQuery } = body;
    const result = await this.queryService.executeQuery(query,countQuery,100);
    return { result };
  } */

}
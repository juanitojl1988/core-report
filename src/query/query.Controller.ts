import { Body, Controller, Get, Logger, Post, Res } from '@nestjs/common';


@Controller('reports')
export class QueryController {
  private readonly logger = new Logger('ReportsController');

}
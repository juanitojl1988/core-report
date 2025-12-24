import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [ ReportsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

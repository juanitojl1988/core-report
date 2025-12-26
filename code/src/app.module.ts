import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';


import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ReportsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

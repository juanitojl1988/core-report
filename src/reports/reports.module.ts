import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { QueryModule } from 'src/query/query.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [QueryModule,AuthModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

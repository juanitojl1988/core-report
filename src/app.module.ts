import { Module } from '@nestjs/common';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '10.1.99.194',
      port: parseInt('5432'),
      username: 'postgres',
      password: '12345678',
      database: 'postgres',
      synchronize: true
    }),
    ReportsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

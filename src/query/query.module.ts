import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.Controller';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [QueryController],
  providers: [PrismaService,QueryService],
  exports: [QueryService],
})
export class QueryModule {}

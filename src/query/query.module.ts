import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.Controller';

@Module({
  controllers: [QueryController],
  providers: [QueryService],
  exports: [QueryService],
})
export class QueryModule {}

import { Module } from '@nestjs/common';
import { MineriaController } from './mineria.controller';
import { MineriaService } from './mineria.service';

@Module({
  controllers: [MineriaController],
  providers: [MineriaService],
  exports: [MineriaService],
})
export class MineriaModule {}

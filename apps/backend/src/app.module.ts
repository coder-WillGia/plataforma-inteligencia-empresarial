import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { MineriaModule } from './modules/mineria/mineria.module';
import { FinanzasModule } from './modules/finanzas/finanzas.module';
import { LogisticaModule } from './modules/logistica/logistica.module';
import { PortalController } from './portal.controller';

@Module({
  imports: [CommonModule, MineriaModule, FinanzasModule, LogisticaModule],
  controllers: [PortalController],
})
export class AppModule {}

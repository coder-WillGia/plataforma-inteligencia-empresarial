import { Controller, Get } from '@nestjs/common';
import { MineriaService } from './modules/mineria/mineria.service';
import { FinanzasService } from './modules/finanzas/finanzas.service';
import { LogisticaService } from './modules/logistica/logistica.service';

@Controller('portal')
export class PortalController {
  constructor(
    private readonly mineriaService: MineriaService,
    private readonly finanzasService: FinanzasService,
    private readonly logisticaService: LogisticaService,
  ) {}

  @Get('resumen')
  getResumenEjecutivo() {
    const mineriaKpis = this.mineriaService.getKpis();
    const mineriaRecs = this.mineriaService.getRecomendaciones();
    const finanzasKpis = this.finanzasService.getKpis();
    const finanzasRecs = this.finanzasService.getRecomendaciones();
    const logisticaKpis = this.logisticaService.getKpis();
    const logisticaRecs = this.logisticaService.getRecomendaciones();

    return {
      estadoSistema: 'Operativo',
      ultimaActualizacion: new Date().toISOString(),
      mineria: {
        kpis: mineriaKpis,
        alertasActivas: mineriaRecs.length,
      },
      finanzas: {
        kpis: finanzasKpis,
        alertasActivas: finanzasRecs.length,
      },
      logistica: {
        kpis: logisticaKpis,
        alertasActivas: logisticaRecs.length,
      },
    };
  }
}

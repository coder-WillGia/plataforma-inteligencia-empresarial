import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PaginatedResult, PaginationQueryDto } from '../dto/pagination.dto';

@Injectable()
export class JsonStorageService {
  private readonly logger = new Logger(JsonStorageService.name);
  private readonly dataDir: string;

  constructor() {
    this.dataDir = this.resolveDataDir();
    this.logger.log(`Directorio de datos JSON resuelto en: ${this.dataDir}`);
  }

  private resolveDataDir(): string {
    const candidates = [
      path.resolve(process.cwd(), 'data'),
      path.resolve(process.cwd(), '..', 'data'),
      path.resolve(process.cwd(), '..', '..', 'data'),
      path.resolve(__dirname, '..', '..', '..', '..', '..', 'data'),
      path.resolve(__dirname, '..', '..', '..', '..', 'data'),
    ];

    for (const candidate of candidates) {
      if (
        fs.existsSync(candidate) &&
        fs.existsSync(path.join(candidate, 'mineria.json'))
      ) {
        return candidate;
      }
    }

    const fallback = path.resolve(process.cwd(), 'data');
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }

  readData<T>(fileName: 'mineria.json' | 'finanzas.json' | 'logistica.json'): T {
    const filePath = path.join(this.dataDir, fileName);
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo de datos ${fileName} no existe en ${filePath}`);
      }
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw) as T;
    } catch (error: any) {
      this.logger.error(`Error leyendo ${fileName}: ${error.message}`);
      throw new InternalServerErrorException(`No se pudo leer el almacenamiento de ${fileName}`);
    }
  }

  writeData<T>(fileName: 'mineria.json' | 'finanzas.json' | 'logistica.json', data: T): void {
    const filePath = path.join(this.dataDir, fileName);
    const tempPath = `${filePath}.tmp`;
    try {
      const serialized = JSON.stringify(data, null, 2);
      fs.writeFileSync(tempPath, serialized, 'utf8');
      fs.renameSync(tempPath, filePath);
    } catch (error: any) {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch {}
      }
      this.logger.error(`Error escribiendo ${fileName}: ${error.message}`);
      throw new InternalServerErrorException(`No se pudo guardar en ${fileName}`);
    }
  }

  paginateAndFilter<T extends Record<string, any>>(
    items: T[],
    query: PaginationQueryDto,
    searchFields: (keyof T)[],
    exactFilters: Partial<Record<keyof T, string | undefined>> = {},
  ): PaginatedResult<T> {
    let filtered = [...items];

    if (query.search && query.search.trim() !== '') {
      const term = query.search.trim().toLowerCase();
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        }),
      );
    }

    for (const [field, filterVal] of Object.entries(exactFilters)) {
      if (filterVal && filterVal !== 'TODOS' && filterVal !== 'ALL') {
        filtered = filtered.filter(
          (item) => String(item[field as keyof T]).toLowerCase() === filterVal.toLowerCase(),
        );
      }
    }

    const total = filtered.length;
    if (query.all === 'true') {
      return {
        data: filtered,
        meta: {
          total,
          page: 1,
          limit: total || 1,
          totalPages: 1,
        },
      };
    }

    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.max(1, Math.min(250, parseInt(query.limit || '10', 10) || 10));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit,
        totalPages,
      },
    };
  }
}

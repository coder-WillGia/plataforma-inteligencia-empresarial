import { Global, Module } from '@nestjs/common';
import { JsonStorageService } from './services/json-storage.service';

@Global()
@Module({
  providers: [JsonStorageService],
  exports: [JsonStorageService],
})
export class CommonModule {}

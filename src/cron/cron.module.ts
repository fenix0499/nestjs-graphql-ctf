import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [CronService],
  imports: [PrismaModule],
})
export class CronModule {}

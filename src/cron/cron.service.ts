import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prismaService: PrismaService,
  ){}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    await this.prismaService.seed();
    this.logger.debug('Database reseted successfully!');
  }
}

import { Injectable, OnModuleInit, Logger, InternalServerErrorException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.debug('PrismaService connected!!!');  
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  public handlePrismaExceptions(error: any): never {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          // Unique constraint failed
          throw new ConflictException('A record with that value already exists.');
        case 'P2003':
          // Foreign key constraint failed
          throw new BadRequestException('Foreign key constraint failed.');
        case 'P2025':
          // Record not found
          throw new NotFoundException('Record not found.');
        case 'P2000':
          // Value too long for column
          throw new BadRequestException('Input value is too long for one of the fields.');
        case 'P2010':
          // Raw query error (e.g., SQL constraint violation)
          throw new BadRequestException('Invalid operation or constraint violation.');
        default:
          // Si el código no es manejado explícitamente
          throw new InternalServerErrorException('Unexpected database error.');
      }
    }

    // Si no es un error conocido de Prisma, relanzar o manejar genéricamente
    throw error;
  }
}

import { join } from 'node:path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TasksModule } from './tasks/tasks.module';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLError } from 'graphql';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: false,
      playground: false,
      // csrfPrevention: false,
      introspection: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      formatError: ({ extensions, ...rest }: GraphQLError) => {
        return {
          ...rest,
          extensions: {
            code: extensions.code,
            originalError: extensions.originalError,
            error: extensions.error,
            statusCode: extensions.statusCode,
          }
        }
      },
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
      ]
    }),
    TasksModule,
    PrismaModule,
    AuthModule,
    UserModule,
    AdminModule,
    CronModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

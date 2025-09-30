import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PhotosModule } from './photos/photos.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity/user.entity';
import { Photo } from './photos/photo.entity/photo.entity';
import { DefaultAzureCredential } from '@azure/identity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const cred = new DefaultAzureCredential();
        const token = await cred.getToken('https://database.windows.net/.default');

        const server = process.env.SQL_SERVER_HOST;   // azure-pet-demo.database.windows.net
        const database = process.env.SQL_DATABASE;    // sqldb-pet-demo
        if (!server || !database) {
          throw new Error('Env vars SQL_SERVER_HOST or SQL_DATABASE are missing');
        }

        return {
          type: 'mssql' as const,
          host: server,          
          port: 1433,
          database,
          entities: [User, Photo],
          synchronize: true,     // in prod set to false
          options: { encrypt: true },
          extra: {
            authentication: {
              type: 'azure-active-directory-access-token',
              options: { token: token?.token },
            },
          },
        };
      },
    }),
    AuthModule,
    PhotosModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PhotosModule } from './photos/photos.module';

@Module({
  imports: [DbModule, UsersModule, AuthModule, PhotosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

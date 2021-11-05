import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NftsController } from './http/nfts/nfts.controller';
import { HttpModule } from './http/http.module';
import { BotServicesModule } from './bot-services/bot-services.module';
import { DatabaseModule } from './database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { NftsService } from './http/nfts/nfts.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotServicesModule,
    //TODO: Inject or fetch by a config
    MongooseModule.forRoot('mongodb+srv://nftport:nftport@nftport-hitesh.43ygw.mongodb.net/nftParser?retryWrites=true&w=majority', { maxPoolSize: 45, minPoolSize: 15 }),
    ScheduleModule.forRoot(),
    HttpModule
  ],
  controllers: [AppController, NftsController],
  providers: [AppService],
})
export class AppModule { }

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionInfo, CollectionInfoSchema } from 'src/database/schemas/collectionInfo.schema';
import { MediaBlobStorage, MediaBlobStorageSchema } from 'src/database/schemas/mediaBlob.schema';
import { TokenMeta, TokenMetaSchema } from 'src/database/schemas/tokenMeta.schema';
import { CrawlerService } from './crawler/crawler.service';

@Module({
  providers: [CrawlerService],
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: CollectionInfo.name, schema: CollectionInfoSchema },
      { name: MediaBlobStorage.name, schema: MediaBlobStorageSchema },
      { name: TokenMeta.name, schema: TokenMetaSchema },
    ])
  ]
})
export class BotServicesModule { }

import { Global, Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionInfo, CollectionInfoSchema } from 'src/database/schemas/collectionInfo.schema';
import { MediaBlobStorage, MediaBlobStorageSchema } from "src/database/schemas/mediaBlob.schema";
import { TokenMeta, TokenMetaSchema } from "src/database/schemas/tokenMeta.schema";
import { NftsController } from "./nfts/nfts.controller";
import { NftsService } from './nfts/nfts.service';

@Module({
  providers: [NftsService],
  exports: [NftsService],
  imports: [
    MongooseModule.forFeature([
      { name: CollectionInfo.name, schema: CollectionInfoSchema },
      { name: MediaBlobStorage.name, schema: MediaBlobStorageSchema },
      { name: TokenMeta.name, schema: TokenMetaSchema },
    ])
  ],
  controllers: [NftsController],
})
export class HttpModule { }

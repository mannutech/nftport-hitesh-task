import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionInfo, CollectionInfoSchema } from './schemas/collectionInfo.schema';
import { MediaBlobStorage, MediaBlobStorageSchema } from './schemas/mediaBlob.schema';
import { TokenMeta, TokenMetaSchema } from './schemas/tokenMeta.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CollectionInfo.name, schema: CollectionInfoSchema },
            { name: MediaBlobStorage.name, schema: MediaBlobStorageSchema },
            { name: TokenMeta.name, schema: TokenMetaSchema },
        ])
    ],
    controllers: [],
    providers: [],
})
export class DatabaseModule {
}

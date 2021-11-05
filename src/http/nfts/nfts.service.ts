import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CollectionInfo, CollectionInfoDocument } from '../../database/schemas/collectionInfo.schema';
import { MediaBlobStorage, MediaBlobStorageDocument } from '../../database/schemas/mediaBlob.schema';
import { TokenMeta, TokenMetaDocument } from '../../database/schemas/tokenMeta.schema';

@Injectable()
export class NftsService {
    constructor(
        @InjectModel(CollectionInfo.name) private readonly nftCollection: Model<CollectionInfoDocument>,
        @InjectModel(TokenMeta.name) private readonly nftTokenMetadata: Model<TokenMetaDocument>,
        @InjectModel(MediaBlobStorage.name) private readonly nftMedia: Model<MediaBlobStorageDocument>,
    ) {
    }

    async searchByName(tokenName: string) {
        const searchDoc = await this.nftCollection.find({
            name: `/${tokenName}/i`
        }).exec();

        Logger.debug(searchDoc[0]);
    }

    async getNftByContractAddressOrTokenId(contractAddress: string, tokenId?: string) {
        if (tokenId) {
            const nftListWithoutMeta = await this.nftCollection.find({
                contractAddress: contractAddress,
                tokenId: tokenId
            }).exec();

            // nftListWithoutMeta.forEa
        }
    }


}

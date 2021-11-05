import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { TokenMeta } from './tokenMeta.schema';

export type CollectionInfoDocument = CollectionInfo & Document;

export enum NFT_STANDARD_VERSION {
    ERC721 = 721,
    ERC1155 = 1155,
}

@Schema({
    autoCreate: true,
})

// We can create a top level contractCOllection

export class CollectionInfo {

    @Prop({ required: true, index: true })
    contractAddress: string;

    @Prop({ required: true, index: true })
    tokenId: string;

    @Prop()
    name: string;

    // @Prop({
    //     default: 0
    // })
    // totalSupply?: number;

    @Prop({
        enum: NFT_STANDARD_VERSION
    })
    contractType: NFT_STANDARD_VERSION;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'TokenMeta' })
    tokenMetadataRef: TokenMeta;

    @Prop({
        enum: ['eth']
    })
    blockchainNetwork: string;

    @Prop()
    baseURI?: string;

    @Prop()
    refreshMetadataRequested: boolean;

    @Prop()
    mintedAt?: Date;

    @Prop()
    updatedAt?: Date;

    @Prop({ default: new Date() })
    createdAt: Date;

    @Prop()
    deletedAt?: Date;
}

export const CollectionInfoSchema = SchemaFactory.createForClass(CollectionInfo);
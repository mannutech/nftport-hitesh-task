import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { MediaBlobStorage } from './mediaBlob.schema';

export type TokenMetaDocument = TokenMeta & Document;

@Schema({
    autoCreate: true
})
export class TokenMeta {

    @Prop()
    hasCommonAttributes: boolean;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'MediaBlobStorage' })
    blobDataRef: MediaBlobStorage;

    @Prop()
    tokenAttributes: string;

    @Prop()
    metadataURL?: string;

    @Prop()
    mediaFileURL?: string;

    @Prop()
    updatedAt?: Date;

    @Prop({ default: new Date() })
    createdAt: Date;

    @Prop()
    deletedAt?: Date;
}

export const TokenMetaSchema = SchemaFactory.createForClass(TokenMeta);
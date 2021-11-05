import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MediaBlobStorageDocument = MediaBlobStorage & Document;

@Schema({
    autoCreate: true
})
export class MediaBlobStorage {

    @Prop({
    })
    blobHash: string; // sha256(blob_data)

    @Prop({
        // text: true
    })
    blob: string;

    @Prop()
    mediaType?: string;

    @Prop({
    })
    mediaInfo?: string; // metadata about the media file

    @Prop()
    updatedAt?: Date;

    @Prop({ default: new Date() })
    createdAt: Date;

    @Prop()
    deletedAt?: Date;
}

export const MediaBlobStorageSchema = SchemaFactory.createForClass(MediaBlobStorage);
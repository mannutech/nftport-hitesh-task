import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CollectionInfo, CollectionInfoDocument, NFT_STANDARD_VERSION } from '../../database/schemas/collectionInfo.schema';
import { TokenMeta, TokenMetaDocument } from '../../database/schemas/tokenMeta.schema';
import { MediaBlobStorage, MediaBlobStorageDocument } from '../../database/schemas/mediaBlob.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { supportedNetworks } from 'config/static.network';
import { networkToNFTPortNetwork } from '../../../config/static.network';
import { NFTContractDataResponse, NftInfo } from './dto/response.contractData';
import { NFT_COLLECTIONS_TO_INDEX } from '../../../config/collections';
import { Cron, CronExpression } from '@nestjs/schedule';
import { map } from 'rxjs/operators';
import { promisify } from 'util';
import stream from 'stream';

const sleep = m => new Promise(r => setTimeout(r, m))


@Injectable()
export class CrawlerService {

    private readonly logger = new Logger(CrawlerService.name);

    private NFT_PORT_AUTHORISATION_TOKEN: string;

    private syncing = false; // Move the current sync progress to DATABASE.

    constructor(
        @InjectModel(CollectionInfo.name) private readonly nftCollection: Model<CollectionInfoDocument>,
        @InjectModel(TokenMeta.name) private readonly nftTokenMetadata: Model<TokenMetaDocument>,
        @InjectModel(MediaBlobStorage.name) private readonly nftMedia: Model<MediaBlobStorageDocument>,
        private httpClient: HttpService,
        private configClient: ConfigService
    ) {
        this.NFT_PORT_AUTHORISATION_TOKEN = configClient.get('NFT_PORT_AUTHORISATION_TOKEN');
        //TODO: validate `this.NFT_PORT_AUTHORISATION_TOKEN`

        this.logger.debug(`CRON_JOB_TO_LOAD_SMART_CONTRACT_ACTIVATED`)
    }

    /**
     * Fetches Token related info from NFT port API
     * @param contractAddress {STRING}
     * @param chain {STRING}
     */
    public async fetchAndSaveTokenDataByContractAddress(contractAddress: string, chain: string) {

        //TODO: validate `contractAddress`
        //TODO: fetch api url dynamically
        //TODO: throw on unsupported networks

        let requestOptions = {
            method: 'GET',
            url: `https://api.nftport.xyz/v0/nfts/${contractAddress}`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.NFT_PORT_AUTHORISATION_TOKEN
            }
        };
        let currentPage = 1, totalPages = 1;
        let fetchedNFTDataList: NftInfo[] = [];

        this.logger.debug(`Parsing: Contract Address: ${contractAddress} | Current page = ${currentPage} | Total Pages = ${totalPages} | ${requestOptions.url}`);


        //handling paginated response
        while (true) {

            this.logger.debug(`Parsing: Contract Address: ${contractAddress} | Current page = ${currentPage} | Total Pages = ${totalPages}`);

            const nftsDataResponse = await this.httpClient.get<NFTContractDataResponse>(requestOptions.url, {
                params: {
                    chain: networkToNFTPortNetwork.ETH,
                    page_number: currentPage,
                    page_size: 50,
                    include: 'all' //'metadata' , 'default'
                },
                headers: requestOptions.headers
            }).toPromise();

            // TODO: check `response status`
            if (nftsDataResponse.data.response !== 'OK') {
                this.logger.error(`Response not OK`);
                // throw new Error(nftsData.data.response);
                continue;
            }

            if (currentPage > totalPages && nftsDataResponse.data.nfts.length === 0) {
                this.logger.debug('Reached the last page of parsing')
                break;
            }

            this.logger.debug(`Total NFTs received: ${nftsDataResponse.data.nfts.length}`);

            // Push to the final list
            fetchedNFTDataList.push(...nftsDataResponse.data.nfts);

            totalPages = nftsDataResponse.data.total;
            currentPage += 1;

            // Save these to database
            // Note. We should batch insert the results for DB efficiency
            nftsDataResponse.data.nfts.forEach(async (nftData) => {
                await this.saveTokenDataToDB(nftData)
            })

            // Sleep for a few seconds
            if (currentPage % 1 === 0) {
                this.logger.debug('Sleeping for 5 Seconds');
                await sleep(5000)
            }
        }

        return fetchedNFTDataList;
    }

    private async saveTokenDataToDB(nftData: NftInfo) {
        // Restructure data
        // Download image file
        const mediaBlobString = await this.downloadFileByURL(nftData.file_url, '');
        const mediaBlobHash = this.getFileBlobHash(mediaBlobString)

        // Save Image file (`MediaBlobStorage`)
        // Note: I don't recommend storing images to Database, I would instead choose a file storage service for the same and just store the `path` or the `hash` of the file.
        this.logger.debug(`Saving NFT File Data to DB for ${nftData.contract_address} | ${nftData.token_id}`);
        const savedMediaDoc = await this.nftMedia.create({
            blob: mediaBlobString,
            blobHash: mediaBlobHash,
        });
        this.logger.debug(`Saved NFT File Data to DB ${nftData.contract_address} | ${nftData.token_id}`);


        // Insert token metadata (ref. _id to `MediaBlobStorage`)
        this.logger.debug(`Saving NFT Token Metadata to DB ${nftData.contract_address} | ${nftData.token_id}`);
        const savedTokenMetadata = await this.nftTokenMetadata.create({

            hasCommonData: false,
            tokenAttributes: JSON.stringify(nftData.metadata.attributes),
            blobDataRef: savedMediaDoc._id,
            metadataURL: nftData.metadata_url,
            mediaFileURL: nftData.metadata.image || nftData.metadata.video,
            createdAt: new Date()
        });
        this.logger.debug(`Saved NFT Token Metadata. ${nftData.contract_address} | ${nftData.token_id}`);


        // Insert to collection (ref. _id to `TokenMeta`)
        this.logger.debug(`Saving NFT COllection Information to DB ${nftData.contract_address} | ${nftData.token_id}`);
        const savedCollectionMetadata = await this.nftCollection.create({
            contractAddress: nftData.contract_address,
            tokenId: nftData.token_id,
            name: nftData.metadata.name, // We can support collection name as well
            contractType: NFT_STANDARD_VERSION.ERC721,  // Todo: need to check erc type
            tokenMetadataRef: savedTokenMetadata._id,
            blockchainNetwork: 'eth',
            refreshMetadataRequested: false
        })
        this.logger.debug(`Saved NFT COllection Information ${nftData.contract_address} | ${nftData.token_id}`);

    }

    private async downloadFileByURL(fileUrl: string, outputLocationPath: string) {
        //         import * as stream from 'stream';
        // import { promisify } from 'util';

        // const finished = promisify(stream.finished);

        // const writer = createWriteStream(outputLocationPath);
        // return this.httpClient.request({
        //     method: 'get',
        //     url: fileUrl,
        //     responseType: 'stream',
        // }).toPromise()
        // .then(async response => {
        //     response.data.pipe(writer);
        //     return finished(writer); //this is a Promise
        // });

        return 'someStringBlob';
    }

    private getFileBlobHash(blob: String) {
        return `someUniqueFileHash_${Math.random()}`;
    }

    @Cron(CronExpression.EVERY_MINUTE)
    private async init() {
        if (!this.syncing) {
            NFT_COLLECTIONS_TO_INDEX.forEach(async (contractAddress) => {
                this.syncing = true;
                await this.fetchAndSaveTokenDataByContractAddress(contractAddress, 'ETH');
            });
            // this.syncing = true;
            // await this.fetchAndSaveTokenDataByContractAddress(NFT_COLLECTIONS_TO_INDEX[0], 'ETH');
        }
    }
}

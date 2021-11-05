import { Controller, Get, Inject, Logger, Param, Query } from '@nestjs/common';
import { NftsService } from './nfts.service';
import { isEthereumAddress } from '../../utils/ethereum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CollectionInfo, CollectionInfoDocument } from 'src/database/schemas/collectionInfo.schema';
import { MediaBlobStorage, MediaBlobStorageDocument } from 'src/database/schemas/mediaBlob.schema';
import { TokenMeta, TokenMetaDocument } from 'src/database/schemas/tokenMeta.schema';


@Controller('nfts')
export class NftsController {

    constructor(private nftService: NftsService) {
    }

    @Get('/:contractAddrOrName/:tokenId')
    async searchByName(
        @Query('chain') chain: string,
        @Query('page_number') pageNumber?: number,
        @Param('contractAddrOrName') contractAddrOrName?: string,
        @Param('tokenId') tokenId?: string,
    ) {
        Logger.debug('reaching')
        if (isEthereumAddress(contractAddrOrName)) {
            if (tokenId) {
                // Get by ContractAddress and TokenId    
                return await this.nftService.getNftByContractAddressOrTokenId(contractAddrOrName, tokenId);
            } else {
                // Return all by `ContractAddress`
                return await this.nftService.getNftByContractAddressOrTokenId(contractAddrOrName);
            }
        } else {
            // If The search string is not an ethereum address, search by token data
            return await this.nftService.searchByName(contractAddrOrName);
        }
    }

}

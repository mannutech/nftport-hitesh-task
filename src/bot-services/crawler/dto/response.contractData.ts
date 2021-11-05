export interface NFTContractDataResponse {
    response: string;
    nfts: NftInfo[];
    total: number;
}

export interface NftInfo {
    chain: string;
    contract_address: string;
    token_id: string;
    metadata: Metadata;
    metadata_url: string;
    file_url: string;
    cached_file_url: string;
    mint_date: null;
    file_information: FileInformation;
    updated_date: Date;
}

export interface FileInformation {
    height: number;
    width: number;
    file_size: number;
}

export interface Metadata {
    attributes: Attribute[];
    image?: string;
    video?: string;
    name: string;
}

export interface Attribute {
    trait_type: string;
    value: string;
}

export enum PartnerStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum HostingType {
    MQ = 'MQ',
    DIRECTORY = 'DIRECTORY',
    PRINTER = 'PRINTER',
    S3 = 'S3'
}

export interface Partner {
    id: string;
    status: PartnerStatus;
    hostingType: HostingType;
    alias: string;
    queueName: string;
    application?: string;
    description: string;
}
export interface Profile {
    id?: string;
    code: string;
    description: string;
    scopes: string[];
    createdAt?: Date;
    updatedAt?: Date;
    lastModifiedBy?: string;
}
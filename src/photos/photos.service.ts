import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultAzureCredential } from '@azure/identity';
import {
    BlobServiceClient,
    BlobSASPermissions,
    generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import * as jwt from 'jsonwebtoken';
import { Photo } from './photo.entity/photo.entity';

@Injectable()
export class PhotosService {
    constructor(@InjectRepository(Photo) private photos: Repository<Photo>) { }

    private get account() {
        const name = process.env.STORAGE_ACCOUNT_NAME;
        if (!name) throw new Error('STORAGE_ACCOUNT_NAME is missing');
        return name;
    }
    private get containerName() {
        return process.env.STORAGE_CONTAINER_NAME || 'photos';
    }


    getUserIdFromReq(req: any) {
        const cookie = req.headers?.cookie || '';
        const m = cookie.match(/(?:^|;\s*)token=([^;]+)/);
        if (!m) return null;
        try {
            const decoded: any = jwt.verify(m[1], process.env.JWT_SECRET || 'dev_secret');
            return decoded.sub as string;
        } catch {
            return null;
        }
    }

    /** Создаём краткоживущий SAS для загрузки (PUT) и пишем запись в БД */
    async createUploadUrl(userId: string, fileName: string) {
        const cred = new DefaultAzureCredential();
        const service = new BlobServiceClient(`https://${this.account}.blob.core.windows.net`, cred);
        const container = service.getContainerClient(this.containerName);
        await container.createIfNotExists();

        const safeName = fileName?.replace(/[^\w.\-]/g, '_') || 'photo.jpg';
        const blobName = `${userId}/${Date.now()}_${safeName}`;

        // User Delegation SAS (нужна роль "Storage Blob Data Contributor" на Storage Account)
        const startsOn = new Date(Date.now() - 60_000);
        const expiresOn = new Date(Date.now() + 10 * 60_000); // 10 минут
        const udk = await service.getUserDelegationKey(startsOn, expiresOn);

        const sas = generateBlobSASQueryParameters(
            {
                containerName: this.containerName,
                blobName,
                permissions: BlobSASPermissions.parse('cw'), // create + write
                startsOn,
                expiresOn,
            },
            udk,
            this.account,
        ).toString();

        const uploadUrl = `https://${this.account}.blob.core.windows.net/${this.containerName}/${blobName}?${sas}`;

        // сохраняем запись
        await this.photos.save(this.photos.create({ user_id: userId, blob_name: blobName }));

        return { uploadUrl, blobName };
    }

    async list(userId: string) {
        return this.photos.find({ where: { user_id: userId }, order: { created_at: 'DESC' } });
    }
}

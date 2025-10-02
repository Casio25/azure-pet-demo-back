import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { PhotosService } from './photos.service';

@Controller('photos')
export class PhotosController {
    constructor(private srv: PhotosService) { }

    @Post('upload-url')
    async uploadUrl(@Query('name') name: string, @Req() req: any, @Res() res: Response) {
        const uid = this.srv.getUserIdFromReq(req);
        if (!uid) return res.status(401).json({ error: 'unauthorized' });
        const r = await this.srv.createUploadUrl(uid, name);
        return res.json(r);
    }

    @Get()
    async list(@Req() req: any, @Res() res: Response) {
        const uid = this.srv.getUserIdFromReq(req);
        if (!uid) return res.status(401).json([]);
        const items = await this.srv.list(uid);
        return res.json(items);
    }
}

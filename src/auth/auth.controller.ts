import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
    constructor(private srv: AuthService) { }

    @Post('register')
    register(@Body() dto: { email: string; password: string }) {
        return this.srv.register(dto.email, dto.password);
    }

    @Post('login')
    async login(@Body() dto: { email: string; password: string }, @Res() res: Response) {
        const { token } = await this.srv.login(dto.email, dto.password);
        
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 3600_000 });
        return res.json({ ok: true });
    }

    @Get('me')
    me(@Req() req: any) {
        const c = req.headers.cookie || '';
        const m = c.match(/(?:^|;\s*)token=([^;]+)/);
        if (!m) return { auth: false, reason: 'no cookie' };
        try {
            const p: any = jwt.verify(m[1], process.env.JWT_SECRET ||"dev_secret");
            return { auth: true, sub: p.sub };
        } catch (e) {
            return { auth: false, reason: (e as Error).message };
        }
    }
}

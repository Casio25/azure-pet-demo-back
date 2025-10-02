import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private users: Repository<User>,
        private jwt: JwtService,
    ) { }

    async register(email: string, password: string) {
        const exists = await this.users.findOne({ where: { email } });
        if (exists) throw new ConflictException('Email exists');

        const hash = await bcrypt.hash(password, 10);
        const u = this.users.create({ email, password_hash: Buffer.from(hash) });
        await this.users.save(u);

        return { ok: true };
    }

    async login(email: string, password: string) {
        const u = await this.users.findOne({ where: { email } });
        if (!u) throw new UnauthorizedException();

        const ok = await bcrypt.compare(password, Buffer.from(u.password_hash).toString());
        if (!ok) throw new UnauthorizedException();

        const token = await this.jwt.signAsync({ sub: u.id });
        return { token };
    }
}

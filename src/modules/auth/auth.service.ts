import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class AuthService {
    private readonly logger: Logger = new Logger(AuthService.name)
    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService, private readonly prisma: DatabaseService) {

    }

    async generateJwt(type: "ACCESS_TOKEN" | "REFRESH_TOKEN", payload: { role: string, userId: string, tenantId?: string }, slug: string) {
        try {
            const audience = this.configService.get<string>("AUDIENCE")
            const token_expiry = type == "ACCESS_TOKEN" ? this.configService.get<string>("ACCESS_TOKEN_EXPIRY") : this.configService.get<string>("REFRESH_TOKEN_EXPIRY");
            const jwtPayload = {
                ...payload,
                sub: payload.userId,
                type,
                iat: Math.floor(Date.now() / 1000),
            };
            const jwt = await this.jwtService.signAsync(jwtPayload, { expiresIn: token_expiry, issuer: slug, audience })
            return jwt;
        } catch (error) {
            this.logger.error(error)
            throw new InternalServerErrorException("Failed to generate Jwt");
        }
    }
}


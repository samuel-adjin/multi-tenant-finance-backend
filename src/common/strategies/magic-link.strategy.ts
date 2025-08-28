import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import MagicLoginStrategy from "passport-magic-login";
import { ITokenPayload, UserAuthService } from "../../modules/auth/user-auth/user-auth.service";
import { ConfigService } from "@nestjs/config";

export type IPayload = {
  destination: string;
};

@Injectable()
export class MagicLinkLoginStrategy extends PassportStrategy(MagicLoginStrategy as any, 'magiclogin') {
  private readonly logger: Logger = new Logger(MagicLinkLoginStrategy.name)
  constructor(private readonly userAuthService: UserAuthService, private readonly configService: ConfigService) {
    super({
      jwtOptions: { expiresIn: configService.get<string>('MAGIC_LOGIN_JWT_EXPIRATION') || "15m" },
      secret: configService.get<string>('MAGIC_LOGIN_JWT_SECRET') || "jwtConstants.secret",
      sendMagicLink: async (destination: IPayload, href: string) => {
        this.logger.log(`Sending magic link to ${destination.destination}: ${href}`);
      },
      callbackUrl: configService.get<string>('MAGIC_LOGIN_CALLBACK_URL') || "http://localhost:3000/auth/user/magiclogin/callback",
      verify: async (payload: any, done: any) => {
        try {
          const user = await this.validate(payload);
          done(null, user);
        } catch (err) {
          done(err);
        }
      },
    } as any);
  }


  async validate(payload: ITokenPayload) {
    return this.userAuthService.validateLoginRequest(payload);
  }
}

// useFactory to inject 


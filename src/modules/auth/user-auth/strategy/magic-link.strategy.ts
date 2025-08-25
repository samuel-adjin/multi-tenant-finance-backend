import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { DatabaseService } from "src/common/database/database.service";

import MagicLoginStrategy from "passport-magic-login";
import { ITokenPayload, UserAuthService } from "../user-auth.service";

export type IPayload = {
  destination: string;
};

@Injectable()
export class MagicLinkLoginStrategy extends PassportStrategy(MagicLoginStrategy as any,'magiclogin') {
    private readonly logger:Logger = new Logger(MagicLinkLoginStrategy.name)
  constructor(private readonly userAuthService: UserAuthService) {
    super({
      jwtOptions: { expiresIn: "15m" },
      secret: "your-secret-key",
      sendMagicLink: async (destination: IPayload, href: string) => {
        this.logger.log(`Sending magic link to ${destination.destination}: ${href}`);
      },
      callbackUrl: "http://localhost:3000/auth/user/magiclogin/callback",
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


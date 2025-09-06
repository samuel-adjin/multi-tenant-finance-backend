import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import MagicLoginStrategy from "passport-magic-login";
import { ITokenPayload, UserAuthService } from "../../modules/auth/user-auth/user-auth.service";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "../email/email.service";

export type IPayload = {
  destination: string;
  slug: string
};

@Injectable()
export class MagicLinkLoginStrategy extends PassportStrategy(MagicLoginStrategy as any, 'magiclogin') {
  private readonly logger: Logger = new Logger(MagicLinkLoginStrategy.name)
  constructor(private readonly userAuthService: UserAuthService, private readonly configService: ConfigService, private readonly emailService: EmailService) {
    super({
      jwtOptions: { expiresIn: configService.get<string>('MAGIC_LOGIN_JWT_EXPIRATION') || "15m" },
      secret: configService.get<string>('MAGIC_LOGIN_JWT_SECRET') || "jwtConstants.secret",
      sendMagicLink: async (destination: IPayload, href: string) => {
        const user = await userAuthService.findUserByEmailSlug(destination.destination, destination.slug)
        if (user) {
          await this.emailService.sendEmail({
            to: user?.email,
            subject: 'Login Link',
            template: 'magic-link',
            context: {
              name: user.firstName,
              magicLink: href
            }
          });
        }

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


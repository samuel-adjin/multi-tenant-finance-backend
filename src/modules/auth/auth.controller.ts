import { Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserAuthService } from './user-auth/user-auth.service';
import { MagicLinkLoginStrategy } from './user-auth/strategy/magic-link.strategy';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth/')
export class AuthController {

    constructor(private readonly userAuthService: UserAuthService, private readonly magicLinkStrategy: MagicLinkLoginStrategy) {

    }
    private readonly logger: Logger = new Logger(AuthController.name)

    @Post('user/login')
    async login(@Req() req, @Res() res) {
        this.magicLinkStrategy.send(req, res);
    }

    @Get('user/magiclogin/callback')
    @UseGuards(AuthGuard('magiclogin'))
    callback(@Req() req) {
        // generate jwt
        return { ok: true, user: req.user };
    }
}

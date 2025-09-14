import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { MagicLinkLoginStrategy } from '../../common/strategies/magic-link.strategy';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { UserAuthService } from './user-auth/user-auth.service';
import { skipInterceptor } from '../../common/decorators/skipInterceptor.decorator';

@Controller('auth/')
export class AuthController {

    constructor(private readonly authService: AuthService, private readonly magicLinkStrategy: MagicLinkLoginStrategy, private readonly userAuthService: UserAuthService) {

    }

    @Public()
    @skipInterceptor()
    @Post('user/login')
    async login(@Req() req, @Res() res) {
        req.body.destination = { destination: req.body.destination, slug: req.body.slug }
        this.magicLinkStrategy.send(req, res);
    }

    @Public()
    @Get('user/magiclogin/callback')
    @UseGuards(AuthGuard('magiclogin'))
    async callback(@Req() req) {
        const slug = req.user.tenant.slug;
        const payload = { role: req.user.role, userId: req.user.id, tenantId: req.user.tenant.id, };
        const accessToken = await this.authService.generateJwt("ACCESS_TOKEN", payload, slug,);
        const refreshToken = await this.authService.generateJwt("REFRESH_TOKEN", payload, slug);

        return {
            accessToken,
            refreshToken,
            role: req.user.role
        }
    }

    @Public()
    @Post("verify-account")
    async verifyAccount(@Body() verifyToken: string) {
        return this.userAuthService.verifyUser(verifyToken);
    }
}



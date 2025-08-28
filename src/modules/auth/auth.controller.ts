import { Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { MagicLinkLoginStrategy } from '../../common/strategies/magic-link.strategy';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth/')
export class AuthController {

    constructor(private readonly authService: AuthService, private readonly magicLinkStrategy: MagicLinkLoginStrategy) {

    }
    private readonly logger: Logger = new Logger(AuthController.name)

    @Public()
    @Post('user/login')
    async login(@Req() req, @Res() res) {
        this.magicLinkStrategy.send(req, res);
    }

    @Public()
    @Get('user/magiclogin/callback')
    @UseGuards(AuthGuard('magiclogin'))
    async callback(@Req() req) {
        const slug = req.user.tenant.slug;
        const payload = { role: req.user.role, userId: req.user.id, tenantId: req.user.tenant.id }
        const accessToken = await this.authService.generateJwt("ACCESS_TOKEN", payload, slug);
        const refreshToken = await this.authService.generateJwt("REFRESH_TOKEN", payload, slug);
        return {
            accessToken, refreshToken
        }
    }
}

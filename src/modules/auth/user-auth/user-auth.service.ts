import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import token from "../../../common/utils/crypto-token.utils"

export type ITokenPayload = {
    destination: { destination: string, slug: string },
}

@Injectable()
export class UserAuthService {
    constructor(private readonly prisma: DatabaseService) { }
    private readonly logger: Logger = new Logger(UserAuthService.name);


    validateLoginRequest = async (payload: ITokenPayload) => {
        try {
            const slug = payload.destination.slug;
            const email = payload.destination.destination;

            const tenant = await this.prisma.byPassRls().tenant.findUnique({
                where: {
                    slug
                }
            });
            if (!tenant) {
                throw new UnauthorizedException("Unauthorized access")
            }

            const user = await this.prisma.byPassRls().user.findUnique({
                where: {
                    tenantId_email: {
                        tenantId: tenant?.id,
                        email
                    }
                },
                include: {
                    tenant: {
                        select: {
                            slug: true,
                            id: true
                        }

                    }
                }
            });
            if (!user) {
                throw new UnauthorizedException("User does not exist")
            }
            if (user.isLocked) {
                throw new UnauthorizedException("User Account is locked contact your administrator")
            }
            if (!user.isVerified) {
                throw new UnauthorizedException("User account is not verified")
            }

            return user;
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

    verifyUser = async (verifyToken: string) => {
        try {
            if (!verifyToken?.trim()) {
                throw new BadRequestException("Invalid or empty token")
            }
            const tokenHash = token.createSha(verifyToken);
            const verificationToken = await this.prisma.byPassRls().verificationToken.findFirst({
                where: {
                    tokenHash
                }
            });
            if (!verificationToken) {
                throw new BadRequestException("Token does not exist")
            }
            const isTokenExpired = verificationToken.expiresAt < new Date();
            if (isTokenExpired) {
                throw new BadRequestException("Token has expired contact your admin for new verfication link")
            }
            await this.prisma.byPassRls().$transaction(async (tx) => {
                await tx.verificationToken.update({
                    where: {
                        id: verificationToken.id
                    },
                    data: {
                        consumedAt: new Date(),
                    }
                });
                await tx.user.update({
                    where: {
                        id: verificationToken.userId
                    },
                    data: {
                        isVerified: true,
                        isActive: true
                    }
                })
            })
            return { success: true, message: 'Account verified' }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

}

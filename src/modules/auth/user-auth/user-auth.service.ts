import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';
import { Prisma } from '@prisma/client';
import token from "../crypto-token.utils"
import { AppClsService } from '../../../common/app-cls/app-cls.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../common/email/email.service';
export type ITokenPayload = {
    destination: { destination: string, slug: string },
}

@Injectable()
export class UserAuthService {
    constructor(private readonly prisma: DatabaseService, private readonly appCls: AppClsService, private readonly config: ConfigService, private readonly emailService: EmailService) { }
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


    createUser = async (payload: Prisma.UserCreateInput) => {
        try {
            if (!payload) {
                throw new BadRequestException("Invalid user payload")
            }
            const tenantId = this.appCls.getCurrentTenantId();
            if (!tenantId) throw new UnauthorizedException("Tenant Id not found")
            const existingUser = await this.prisma.withTenant().user.findUnique({
                where: {
                    tenantId_email: {
                        email: payload.email,
                        tenantId
                    }
                }
            });

            if (existingUser) {
                throw new ConflictException("User with this email already exists");
            }
            const { user, rawToken } = await this.prisma.withTenant().$transaction(async (tx) => {

                const user = await tx.user.create({
                    data: payload
                })
                const rawToken = token.createRawToken();
                const tokenHash = token.createSha(rawToken);
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await tx.verificationToken.create({
                    data: {
                        userId: user.id,
                        expiresAt,
                        tokenHash,
                    }
                })

                return { user, rawToken: encodeURIComponent(rawToken) }
            })
            const host = this.config.get<string>('HOST_URL')
            const href = `${host}/verify?token=${rawToken}`
            await this.emailService.sendEmail({
                to: user?.email,
                subject: 'Account Verfication',
                template: 'account-verification',
                context: {
                    name: user.firstName,
                    verificationUrl: href
                }
            });
            return { success: true, message: 'User created' }

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

    findUserByEmailSlug = async (email: string, slug: string) => {
        try {
            if (!slug || !email) {
                throw new BadRequestException("slug or email is missing")
            }
            const tenant = await this.prisma.byPassRls().tenant.findFirst({ where: { slug }, select: { id: true } });
            if (!tenant) {
                throw new BadRequestException("Subddomain not recognized")
            }

            return await this.prisma.byPassRls().user.findUnique({
                where: {
                    tenantId_email: {
                        email,
                        tenantId: tenant.id
                    }
                }
            })
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

    async getAuthUser() {
        try {
            const userId = this.appCls.getCurrentUserId();
            const user = await this.prisma.withTenant().user.findUnique({
                where: {
                    id: userId
                }
            })
            if (!user) {
                throw new NotFoundException("User not found");
            }
            return { success: true, result: user }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

    async getAllActiveUsers(pageSize: number = 10, page: number = 1) {
        try {
            pageSize = Math.max(pageSize, 1);
            page = Math.max(page, 1);
            const skip = (page - 1) * pageSize;
            const totalCount = await this.prisma.withTenant().user.count();
            const totalPages = Math.ceil(totalCount / pageSize) || 1;
            const hasNextPage = page < totalCount;
            const hasPreviousPage = page > 1;
            const users = await this.prisma.withTenant().user.findMany({
                where: {
                    isVerified: true,
                    isLocked: false
                },
                orderBy: {
                    createdAt: 'asc'
                },
                skip,
                take: pageSize
            })
            return {
                success: true, items: users,
                pagination: {
                    currentPage: page,
                    pageSize,
                    totalCount,
                    totalPages,
                    hasNextPage,
                    hasPreviousPage,
                }
            }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }

    async deleteUser(id: string) {
        try {
            const user = await this.prisma.withTenant().user.findUnique({
                where: {
                    id
                }
            });
            if (!user) {
                throw new NotFoundException("User does not exist");
            }
            await this.prisma.withTenant().user.delete({
                where: {
                    id
                }
            })
            return { success: true, result: "User deleted succcessfully" }
        } catch (error) {
            const err = error as Error;
            this.logger.error(`Error occured ${err.message}`)
        }
    }
}

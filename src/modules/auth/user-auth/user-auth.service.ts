import { Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import { DatabaseService } from '../../../common/database/database.service';

export type ITokenPayload = {
    destination:string,
    slug: string
}

@Injectable()
export class UserAuthService {
    constructor(private readonly prisma: DatabaseService){}
    private readonly logger: Logger = new Logger(UserAuthService.name);


     validateLoginRequest = async(payload: ITokenPayload)=>{
        try {
          // destination = slug:email
        console.log("Do you get here",payload)
        const slug =  payload.slug;
        const email =  payload.destination;

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
}

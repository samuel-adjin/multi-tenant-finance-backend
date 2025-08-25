import { Prisma } from "@prisma/client";

export const SUPER_TENANT:Prisma.TenantCreateInput ={
    name: "AA-intl",
    slug:"AA",
    mobile:"0595166509",
    email:"samueladams990@gmail.com",
    owner:"AA group",
    isActive: true,
    User:{
        create:{
            firstName:"SUPER_ADMIN",
            otherNames:"SUPER_ADMIN",
            email:"samueladams990@gmail.com",
            mobile:"0595166509",
            isVerified:true,
            dob: new Date(),
            isActive: true,
        }
    }
}

import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {

    }

    @Post("create-user")
    async createUser(@Body() payload: Prisma.UserCreateInput) {
        return this.userService.createUser(payload)
    }

    @Get('/me')
    async getAuthUser() {
        return this.userService.getAuthUser();
    }

    @Get('')
    async getAllActiveUsers(@Query() query: { pageSize: number, page: number }) {
        return this.userService.getAllActiveUsers(query.pageSize, query.page)
    }

    @Delete(":id")
    async deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id)
    }

    @Get(":email/:slug")
    async findUserByEmailSlug(@Param('slug') email: string, @Param('slug') slug: string) {
        return this.userService.findUserByEmailSlug(email, slug)
    }

    @Get(':id')
    async findUser(@Param('id') id: string) {
        return this.userService.findUser(id)
    }

}

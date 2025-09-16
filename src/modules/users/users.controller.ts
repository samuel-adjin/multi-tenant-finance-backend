import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Query, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserSchema, CreateUserType } from './user.schema';
import { ParseCuidPipe } from 'src/common/pipes/cuid-parse.pipe';
import { ParseStringPipe } from 'src/common/pipes/string-parse.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {

    }

    @Post("create-user")
    @UsePipes(new ZodValidationPipe(CreateUserSchema))
    async createUser(@Body() payload: CreateUserType) {
        return this.userService.createUser(payload)
    }

    @Get('/me')
    async getAuthUser() {
        return this.userService.getAuthUser();
    }

    @Get('')
    async getAllActiveUsers(@Query("pageSize", new DefaultValuePipe(10), ParseIntPipe) pageSize: number, @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number) {
        return this.userService.getAllActiveUsers(pageSize, page)
    }

    @Delete(":id")
    async deleteUser(@Param('id', ParseCuidPipe) id: string) {
        return this.userService.deleteUser(id)
    }

    @Get(":email/:slug")
    async findUserByEmailSlug(@Param('email', ParseStringPipe) email: string, @Param('slug', ParseStringPipe) slug: string) {
        return this.userService.findUserByEmailSlug(email, slug)
    }

    @Get(':id')
    async findUser(@Param('id', ParseCuidPipe) id: string) {
        return this.userService.findUser(id)
    }

}

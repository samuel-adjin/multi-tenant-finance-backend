import { Module } from '@nestjs/common';
import { AppClsService } from './app-cls.service';
import { ClsModule } from 'nestjs-cls';

@Module({
    providers: [AppClsService],
    imports: [
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
            },
        })
    ],
    exports:[AppClsService]
})
export class AppClsModule { }
